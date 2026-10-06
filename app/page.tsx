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
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  // Await searchParams in Next.js 15+ Server Components
  const params = await searchParams;

  const rawPage = parseInt(params.page || '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const category = (params.category as PropertyCategory) || 'All';
  const listingType = (params.type as ListingType) || 'all';
  const searchQuery = (params.q || '').trim();

  // Fetch paginated properties directly on the server from Supabase
  const paginatedData = await getPaginatedProperties({
    page,
    pageSize: 6,
    category,
    listingType,
    searchQuery,
  });

  // Fetch featured properties directly on the server from Supabase
  const featuredProperties = await getFeaturedPropertiesFromSupabase();

  const isDefaultHomeView =
    category === 'All' && listingType === 'all' && !searchQuery && page === 1;

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
        />

        {/* Featured Collections Section (Curated highlight on landing page) */}
        {isDefaultHomeView && featuredProperties.length > 0 && (
          <FeaturedSection properties={featuredProperties} />
        )}

        {/* Available Properties Section with Server-Side Pagination */}
        <NewInMarketSection
          properties={paginatedData.properties}
          activeListingType={listingType}
          category={category}
          searchQuery={searchQuery}
          currentPage={paginatedData.page}
          totalPages={paginatedData.totalPages}
          totalCount={paginatedData.totalCount}
          pageSize={paginatedData.pageSize}
        />
      </main>
    </div>
  );
}
