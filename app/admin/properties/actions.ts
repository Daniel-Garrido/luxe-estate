'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminOrNull } from '@/lib/auth/dal';
import {
  AMENITY_KEYS,
  BADGE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  LISTING_TYPES,
  MAX_COUNT,
  MAX_IMAGES,
  PROPERTY_CATEGORIES,
  PROPERTY_IMAGES_BUCKET,
  TITLE_MAX_LENGTH,
  defaultDisplayLocation,
  slugify,
  storagePathFromUrl,
  type PropertyFieldErrors,
  type PropertyFormValues,
} from '@/lib/properties/form';
import type { Database } from '@/types/database.types';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];

export type SavePropertyIntent = 'draft' | 'publish';

export type SavePropertyResult =
  | { ok: false; error: 'forbidden' | 'notFound' | 'failed' }
  | { ok: false; error: 'invalid'; fieldErrors: PropertyFieldErrors };

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

// Empty string -> null; anything that is not a finite number -> NaN
const optionalNumber = (value: unknown) => {
  const raw = text(value);
  return raw === '' ? null : Number(raw);
};

// Server Functions are public endpoints: every value is re-validated here
function validate(
  input: PropertyFormValues,
  intent: SavePropertyIntent,
  allowedExternalImages: string[]
): { errors: PropertyFieldErrors; data: Omit<PropertyInsert, 'id' | 'slug'> } {
  const errors: PropertyFieldErrors = {};

  const title = text(input.title);
  if (!title) errors.title = 'required';
  else if (title.length > TITLE_MAX_LENGTH) errors.title = 'tooLong';

  const price = optionalNumber(input.price);
  if (price === null) errors.price = 'required';
  else if (!Number.isFinite(price)) errors.price = 'invalidNumber';
  else if (price <= 0) errors.price = 'positive';

  const description = text(input.description);
  if (description.length > DESCRIPTION_MAX_LENGTH) errors.description = 'tooLong';

  const address = text(input.address);
  if (!address) errors.address = 'required';
  const city = text(input.city);
  if (!city) errors.city = 'required';
  const state = text(input.state);
  const country = text(input.country);
  const displayLocation = text(input.displayLocation) || defaultDisplayLocation({ city, state, country });

  const latitude = optionalNumber(input.latitude);
  if (latitude !== null && !(Number.isFinite(latitude) && Math.abs(latitude) <= 90)) {
    errors.latitude = 'latitude';
  }
  const longitude = optionalNumber(input.longitude);
  if (longitude !== null && !(Number.isFinite(longitude) && Math.abs(longitude) <= 180)) {
    errors.longitude = 'longitude';
  }

  const sqm = optionalNumber(input.sqm) ?? 0;
  if (!Number.isFinite(sqm)) errors.sqm = 'invalidNumber';
  else if (sqm < 0) errors.sqm = 'positive';

  const yearBuilt = optionalNumber(input.yearBuilt);
  const maxYear = new Date().getFullYear() + 5;
  if (yearBuilt !== null && !(Number.isInteger(yearBuilt) && yearBuilt >= 1800 && yearBuilt <= maxYear)) {
    errors.yearBuilt = 'year';
  }

  const count = (value: unknown, field: 'beds' | 'baths' | 'parking') => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > MAX_COUNT) {
      errors[field] = 'count';
      return 0;
    }
    return n;
  };
  const beds = count(input.beds, 'beds');
  const baths = count(input.baths, 'baths');
  const parking = count(input.parking, 'parking');

  const badge = text(input.badge);
  if (badge.length > BADGE_MAX_LENGTH) errors.badge = 'tooLong';

  const images = Array.isArray(input.images) ? input.images.filter((url) => typeof url === 'string') : [];
  // Only photos from our bucket, or external ones the property already had (seed data)
  if (images.some((url) => !storagePathFromUrl(url) && !allowedExternalImages.includes(url))) {
    errors.images = 'invalidImage';
  } else if (images.length > MAX_IMAGES) {
    errors.images = 'tooManyImages';
  } else if (intent === 'publish' && images.length === 0) {
    errors.images = 'imagesRequired';
  }

  const listingType = LISTING_TYPES.includes(input.listingType) ? input.listingType : 'buy';
  const category = PROPERTY_CATEGORIES.includes(input.category) ? input.category : 'House';
  const amenities = Array.isArray(input.amenities)
    ? AMENITY_KEYS.filter((key) => input.amenities.includes(key))
    : [];

  return {
    errors,
    data: {
      title,
      price: price ?? 0,
      // Recomputed from `price` by mapRowToProperty
      formatted_price: null,
      price_period: listingType === 'rent' ? '/mo' : null,
      listing_type: listingType,
      category,
      description: description || null,
      address,
      city,
      state: state || null,
      country: country || null,
      display_location: displayLocation,
      latitude,
      longitude,
      sqm,
      year_built: yearBuilt,
      beds,
      baths,
      parking,
      amenities,
      is_featured: input.isFeatured === true,
      badge: badge || null,
      images,
      is_published: intent === 'publish',
    },
  };
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

// Title-based slug, with a short suffix when another property already uses it
async function uniqueSlug(supabase: ServerClient, title: string): Promise<string> {
  const base = slugify(title) || 'property';
  const { data } = await supabase.from('properties').select('id').eq('slug', base).maybeSingle();
  return data ? `${base}-${crypto.randomUUID().slice(0, 6)}` : base;
}

// Deletes photos that were removed from the gallery; external URLs are left alone
async function removeImages(supabase: ServerClient, urls: string[]) {
  const paths = urls.map(storagePathFromUrl).filter((path): path is string => !!path);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove(paths);
  if (error) console.error('Error removing property images:', error.message);
}

// Creates the property when `id` is null, otherwise updates it
export async function saveProperty(
  id: string | null,
  input: PropertyFormValues,
  intent: SavePropertyIntent
): Promise<SavePropertyResult> {
  const admin = await getAdminOrNull();
  if (!admin) return { ok: false, error: 'forbidden' };
  if (id !== null && (typeof id !== 'string' || !id)) return { ok: false, error: 'notFound' };
  const safeIntent: SavePropertyIntent = intent === 'draft' ? 'draft' : 'publish';

  const supabase = await createClient();

  let previousImages: string[] = [];
  if (id) {
    const { data: existing, error } = await supabase
      .from('properties')
      .select('images')
      .eq('id', id)
      .maybeSingle();
    if (error) console.error('Error loading property:', error.message);
    if (!existing) return { ok: false, error: 'notFound' };
    previousImages = existing.images ?? [];
  }

  const { errors, data } = validate(input, safeIntent, previousImages);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: 'invalid', fieldErrors: errors };
  }

  if (id) {
    const { data: updated, error } = await supabase
      .from('properties')
      .update(data)
      .eq('id', id)
      .select('id');
    // RLS filters out rows instead of throwing, so an empty result also means it failed
    if (error || !updated?.length) {
      if (error) console.error('Error updating property:', error.message);
      return { ok: false, error: 'failed' };
    }
    await removeImages(
      supabase,
      previousImages.filter((url) => !data.images?.includes(url))
    );
  } else {
    const { error } = await supabase.from('properties').insert({
      ...data,
      id: crypto.randomUUID(),
      slug: await uniqueSlug(supabase, data.title),
    });
    if (error) {
      console.error('Error creating property:', error.message);
      return { ok: false, error: 'failed' };
    }
  }

  // Home, listings and detail pages all read properties
  revalidatePath('/', 'layout');
  const saved = safeIntent === 'draft' ? 'draft' : id ? 'updated' : 'created';
  redirect(`/admin?saved=${saved}`);
}

// Removes photos uploaded during this form session that were never saved (e.g. replaced or deleted)
export async function discardUploadedImages(urls: string[]): Promise<void> {
  const admin = await getAdminOrNull();
  if (!admin || !Array.isArray(urls)) return;
  const supabase = await createClient();

  // Never delete a photo that a saved property still uses
  const candidates = urls.filter((url) => typeof url === 'string' && storagePathFromUrl(url));
  if (candidates.length === 0) return;
  const { data: inUse } = await supabase
    .from('properties')
    .select('images')
    .overlaps('images', candidates);
  const used = new Set((inUse ?? []).flatMap((row) => row.images ?? []));
  await removeImages(
    supabase,
    candidates.filter((url) => !used.has(url))
  );
}
