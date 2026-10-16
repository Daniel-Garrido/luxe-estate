import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database, PropertyRow } from '@/types/database.types';
import { Property, PropertyCategory, ListingType } from '@/types/property';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/config';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function mapRowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description || undefined,
    price: Number(row.price),
    formattedPrice:
      row.formatted_price ||
      `$${Number(row.price).toLocaleString('en-US')}`,
    pricePeriod: row.price_period || undefined,
    category: row.category,
    listingType: row.listing_type,
    location: {
      address: row.address,
      city: row.city,
      state: row.state || undefined,
      country: row.country || undefined,
      displayLocation: row.display_location,
    },
    specs: {
      beds: row.beds,
      baths: Number(row.baths),
      sqm: Number(row.sqm),
    },
    images:
      row.images && Array.isArray(row.images) && row.images.length > 0
        ? row.images
        : [],
    coordinates: {
      lat: Number(row.latitude) || 37.4419,
      lng: Number(row.longitude) || -122.1430,
    },
    garage: row.parking ?? 0,
    yearBuilt: row.year_built ?? undefined,
    // Translation keys from `property.features.amenityList` in i18n/locales/*.json
    amenities: row.amenities ?? [],
    agent: {
      name: 'Sarah Jenkins',
      title: 'Top Rated Agent',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
      phone: '+1 (555) 234-5678',
      email: 'sarah.jenkins@luxeestate.com',
      rating: 4.9,
    },
    badge: row.badge || undefined,
    badgeType: row.badge_type || undefined,
    isFeatured: row.is_featured,
    isPublished: row.is_published ?? true,
    createdAt: row.created_at,
  };
}

export interface FetchPropertiesParams {
  page?: number;
  pageSize?: number;
  category?: PropertyCategory | string;
  listingType?: ListingType | string;
  searchQuery?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  // Defaults to the public client; the admin dashboard passes its session client to see drafts
  client?: SupabaseClient<Database>;
}

export interface PaginatedPropertiesResult {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

function buildPropertiesQuery(
  params: FetchPropertiesParams = {},
  options?: { count?: 'exact'; head?: boolean }
) {
  const {
    category = 'All',
    listingType = 'all',
    searchQuery = '',
    location = '',
    minPrice,
    maxPrice,
    minBeds,
    minBaths,
    client = supabase,
  } = params;

  let query = client.from('properties').select('*', options);

  if (category && category !== 'All' && category !== 'Any Type') {
    query = query.ilike('category', category);
  }

  if (listingType && listingType !== 'all') {
    query = query.eq('listing_type', listingType as 'buy' | 'rent');
  }

  const effectiveTerm = (location || searchQuery || '').trim();
  if (effectiveTerm.length > 0) {
    query = query.or(
      `title.ilike.%${effectiveTerm}%,display_location.ilike.%${effectiveTerm}%,city.ilike.%${effectiveTerm}%,state.ilike.%${effectiveTerm}%,country.ilike.%${effectiveTerm}%,address.ilike.%${effectiveTerm}%`
    );
  }

  if (minPrice !== undefined && minPrice > 0) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice !== undefined && maxPrice > 0) {
    query = query.lte('price', maxPrice);
  }

  if (minBeds !== undefined && minBeds > 0) {
    query = query.gte('beds', minBeds);
  }

  if (minBaths !== undefined && minBaths > 0) {
    query = query.gte('baths', minBaths);
  }

  return query;
}

export async function getPropertyFilterCount(
  params: FetchPropertiesParams = {}
): Promise<number> {
  try {
    const query = buildPropertiesQuery(params, {
      count: 'exact',
      head: true,
    });
    const { count, error } = await query;
    if (error) {
      console.error('Error counting filtered properties:', error.message);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.error('Exception counting filtered properties:', err);
    return 0;
  }
}

export async function getPaginatedProperties({
  page = 1,
  pageSize = 6,
  category = 'All',
  listingType = 'all',
  searchQuery = '',
  location = '',
  minPrice,
  maxPrice,
  minBeds,
  minBaths,
  client,
}: FetchPropertiesParams = {}): Promise<PaginatedPropertiesResult> {
  const currentPage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize)));
  const from = (currentPage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const query = buildPropertiesQuery(
    {
      category,
      listingType,
      searchQuery,
      location,
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      client,
    },
    { count: 'exact' }
  );

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching properties from Supabase:', error.message);
    return {
      properties: [],
      totalCount: 0,
      page: currentPage,
      pageSize: safePageSize,
      totalPages: 0,
      hasPrev: false,
      hasNext: false,
    };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / safePageSize);
  const properties = (data || []).map(mapRowToProperty);

  return {
    properties,
    totalCount,
    page: currentPage,
    pageSize: safePageSize,
    totalPages,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };
}

export async function getFeaturedPropertiesFromSupabase(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(2);

  if (error) {
    console.error('Error fetching featured properties:', error.message);
    return [];
  }

  return (data || []).map(mapRowToProperty).slice(0, 2);
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Error fetching property by slug (${slug}):`, error.message);
    }
    return null;
  }

  return mapRowToProperty(data);
}

export async function getAllPropertySlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('slug');

  if (error || !data) {
    return [];
  }

  return data.map((item) => item.slug).filter(Boolean);
}
