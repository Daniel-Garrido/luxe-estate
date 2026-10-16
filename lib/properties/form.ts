// Shared by the admin property form (client) and its Server Function: keep it free of server-only imports
import { supabaseUrl } from '@/lib/supabase/config';
import type { PropertyRow } from '@/types/database.types';

export const PROPERTY_CATEGORIES = ['House', 'Apartment', 'Villa', 'Penthouse'] as const;
export const LISTING_TYPES = ['buy', 'rent'] as const;

// Translation keys from `property.features.amenityList` in i18n/locales/*.json
export const AMENITY_KEYS = [
  'pool',
  'garden',
  'climate',
  'smartHome',
  'evCharging',
  'gym',
  'wineCellar',
] as const;

export const DESCRIPTION_MAX_LENGTH = 2000;
export const TITLE_MAX_LENGTH = 120;
export const BADGE_MAX_LENGTH = 30;
export const MAX_IMAGES = 20;
export const MAX_COUNT = 50;

// Must match the bucket created in supabase/migrations/20261015000000_property_admin_and_images.sql
export const PROPERTY_IMAGES_BUCKET = 'property-images';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const bucketUrlPrefix = `${supabaseUrl}/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`;

// Path inside the bucket for one of our public URLs, or null for external images (e.g. Unsplash)
export function storagePathFromUrl(url: string): string | null {
  return url.startsWith(bucketUrlPrefix) ? decodeURIComponent(url.slice(bucketUrlPrefix.length)) : null;
}

// Numbers stay strings while typing so an empty input is not turned into 0
export interface PropertyFormValues {
  title: string;
  price: string;
  listingType: (typeof LISTING_TYPES)[number];
  category: (typeof PROPERTY_CATEGORIES)[number];
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  displayLocation: string;
  latitude: string;
  longitude: string;
  sqm: string;
  yearBuilt: string;
  beds: number;
  baths: number;
  parking: number;
  amenities: string[];
  isFeatured: boolean;
  badge: string;
  images: string[];
}

export type PropertyFormField = keyof PropertyFormValues;

// Keys of `admin.propertyForm.errors` in i18n/locales/*.json
export type PropertyFieldError =
  | 'required'
  | 'invalidNumber'
  | 'positive'
  | 'tooLong'
  | 'latitude'
  | 'longitude'
  | 'year'
  | 'count'
  | 'imagesRequired'
  | 'tooManyImages'
  | 'invalidImage';

export type PropertyFieldErrors = Partial<Record<PropertyFormField, PropertyFieldError>>;

export const emptyPropertyValues: PropertyFormValues = {
  title: '',
  price: '',
  listingType: 'buy',
  category: 'House',
  description: '',
  address: '',
  city: '',
  state: '',
  country: '',
  displayLocation: '',
  latitude: '',
  longitude: '',
  sqm: '',
  yearBuilt: '',
  beds: 0,
  baths: 0,
  parking: 0,
  amenities: [],
  isFeatured: false,
  badge: '',
  images: [],
};

export function rowToFormValues(row: PropertyRow): PropertyFormValues {
  const str = (value: number | null | undefined) => (value == null ? '' : String(value));
  return {
    title: row.title,
    price: str(row.price),
    listingType: row.listing_type,
    category: row.category,
    description: row.description ?? '',
    address: row.address,
    city: row.city,
    state: row.state ?? '',
    country: row.country ?? '',
    displayLocation: row.display_location,
    latitude: str(row.latitude),
    longitude: str(row.longitude),
    sqm: str(row.sqm),
    yearBuilt: str(row.year_built),
    beds: Number(row.beds) || 0,
    baths: Number(row.baths) || 0,
    parking: row.parking ?? 0,
    amenities: row.amenities ?? [],
    isFeatured: row.is_featured,
    badge: row.badge ?? '',
    images: row.images ?? [],
  };
}

// "City, State" (or country) when the admin leaves the display location empty
export function defaultDisplayLocation(values: Pick<PropertyFormValues, 'city' | 'state' | 'country'>) {
  return [values.city, values.state || values.country].map((part) => part.trim()).filter(Boolean).join(', ');
}

// Lowercase ASCII slug from the title, e.g. "Casa Ñandú" -> "casa-nandu"
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}
