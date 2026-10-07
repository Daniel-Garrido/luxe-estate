import { createClient } from '@supabase/supabase-js';
import { Database, PropertyRow } from '@/types/database.types';
import { Property, PropertyCategory, ListingType } from '@/types/property';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bjjymugrdmnvkphzniba.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqanltdWdyZG1udmtwaHpuaWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Mjg5NDgsImV4cCI6MjEwNTUwNDk0OH0.dHp-iK2_k12NDM2YZzEOjlamufIOLzV9IQXAAMDUcXA';

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
    garage: 2,
    amenities: [
      'Smart Home System',
      'Swimming Pool',
      'Central Heating & Cooling',
      'Electric Vehicle Charging',
      'Private Gym',
      'Wine Cellar',
    ],
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
    createdAt: row.created_at,
  };
}

export interface FetchPropertiesParams {
  page?: number;
  pageSize?: number;
  category?: PropertyCategory | string;
  listingType?: ListingType | string;
  searchQuery?: string;
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

export async function getPaginatedProperties({
  page = 1,
  pageSize = 6,
  category = 'All',
  listingType = 'all',
  searchQuery = '',
}: FetchPropertiesParams = {}): Promise<PaginatedPropertiesResult> {
  const currentPage = Math.max(1, Math.floor(page));
  const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize)));
  const from = (currentPage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' });

  // Exclude featured from general market list or include all? Usually all non-featured or all properties.
  // In the design, featured has its own section, but let's allow all or filter by criteria:
  if (category && category !== 'All') {
    query = query.ilike('category', category);
  }

  if (listingType && listingType !== 'all') {
    query = query.eq('listing_type', listingType as 'buy' | 'rent');
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.trim();
    query = query.or(
      `title.ilike.%${q}%,display_location.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`
    );
  }

  // Sort by newest
  query = query.order('created_at', { ascending: false });

  const { data, count, error } = await query.range(from, to);

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
    .limit(4);

  if (error) {
    console.error('Error fetching featured properties:', error.message);
    return [];
  }

  return (data || []).map(mapRowToProperty);
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
