import React from 'react';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSearch } from '@/components/home/HeroSearch';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { NewInMarketSection } from '@/components/home/NewInMarketSection';
import {
  getPaginatedProperties,
  getFeaturedPropertiesFromSupabase,
} from '@/lib/supabase';
import { PropertyCategory, ListingType } from '@/types/property';

export const metadata: Metadata = {
  title: 'LuxeEstate | Architectural Luxury Homes & Waterfront Sanctuaries',
  description:
    'Discover exceptional luxury properties, architectural villas, and skyline penthouses curated for the discerning buyer. Real-time listings connected with Supabase.',
};

// Force dynamic server rendering so server-side pagination with searchParams works on every request
export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    type?: string;
    q?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    amenities?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  // Await searchParams in Next.js 15+ Server Components
  const params = await searchParams;

  const rawPage = parseInt(params.page || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  // Normalize category against valid options
  const rawCategory = (params.category || 'All').trim();
  const validCategories: PropertyCategory[] = [
    'All',
    'House',
    'Apartment',
    'Villa',
    'Penthouse',
  ];
  const category: PropertyCategory =
    validCategories.find(
      (c) => c.toLowerCase() === rawCategory.toLowerCase()
    ) || 'All';

  const rawType = (params.type || 'all').trim().toLowerCase();
  const listingType: ListingType =
    rawType === 'buy' || rawType === 'rent' ? rawType : 'all';

  const searchQuery = (params.q || params.location || '').trim();
  const minPrice = params.minPrice ? parseInt(params.minPrice, 10) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice, 10) : undefined;
  const beds = params.beds ? parseInt(params.beds, 10) : undefined;
  const baths = params.baths ? parseFloat(params.baths) : undefined;
  const amenities = params.amenities
    ? params.amenities.split(',').filter(Boolean)
    : undefined;

  // Check if ANY filter or search has been applied
  const hasCategoryFilter = category.toLowerCase() !== 'all';
  const hasSearchFilter = searchQuery.length > 0;
  const hasTypeFilter = listingType.toLowerCase() !== 'all';
  const hasPriceFilter = Boolean(
    (minPrice !== undefined && minPrice > 0) ||
      (maxPrice !== undefined && maxPrice < 20000000)
  );
  const hasRoomFilter = Boolean(
    (beds !== undefined && beds > 0) || (baths !== undefined && baths > 0)
  );
  const hasAmenityFilter = Boolean(amenities && amenities.length > 0);
  const isPaginated = page > 1;

  const isFilterOrSearchApplied =
    hasCategoryFilter ||
    hasSearchFilter ||
    hasTypeFilter ||
    hasPriceFilter ||
    hasRoomFilter ||
    hasAmenityFilter ||
    isPaginated;

  // Fetch paginated properties directly on the server from Supabase
  const paginatedData = await getPaginatedProperties({
    page,
    pageSize: 6,
    category,
    listingType,
    searchQuery,
    minPrice,
    maxPrice,
    minBeds: beds,
    minBaths: baths,
  });

  // Fetch featured properties directly on the server from Supabase (strictly max 2)
  const featuredProperties = isFilterOrSearchApplied
    ? []
    : (await getFeaturedPropertiesFromSupabase()).slice(0, 2);

  return (
    <div className="min-h-screen bg-clear-day text-nordic-dark font-display antialiased selection:bg-mosque selection:text-white">
      {/* Navigation Bar */}
      <Navbar activeListingType={listingType} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Hero & Search Section */}
        <HeroSearch
          initialSearchQuery={searchQuery}
          selectedCategory={category}
          activeListingType={listingType}
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
          initialBeds={beds}
          initialBaths={baths}
          initialAmenities={amenities}
        />

        {/* Featured Collections Section: ONLY shown on clean default view (no search or filter active), exactly 2 items */}
        {!isFilterOrSearchApplied && featuredProperties.length > 0 && (
          <FeaturedSection properties={featuredProperties} />
        )}

        {/* Available Properties Section with Server-Side Pagination */}
        <NewInMarketSection
          properties={paginatedData.properties}
          activeListingType={listingType}
          category={category}
          searchQuery={searchQuery}
          minPrice={minPrice}
          maxPrice={maxPrice}
          beds={beds}
          baths={baths}
          amenities={amenities}
          currentPage={paginatedData.page}
          totalPages={paginatedData.totalPages}
          totalCount={paginatedData.totalCount}
          pageSize={paginatedData.pageSize}
        />
      </main>
    </div>
  );
}
