import React from 'react';
import Link from 'next/link';
import { Property, ListingType, PropertyCategory } from '@/types/property';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { Pagination } from '@/components/home/Pagination';

interface NewInMarketSectionProps {
  properties: Property[];
  activeListingType: ListingType;
  category?: PropertyCategory;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPropertySelect?: (property: Property) => void;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
}

export const NewInMarketSection: React.FC<NewInMarketSectionProps> = ({
  properties,
  activeListingType,
  category = 'All',
  searchQuery = '',
  minPrice,
  maxPrice,
  beds,
  baths,
  amenities,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPropertySelect,
  onFavoriteToggle,
}) => {
  const tabs: { label: string; value: ListingType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Buy', value: 'buy' },
    { label: 'Rent', value: 'rent' },
  ];

  const buildTabUrl = (type: ListingType) => {
    const params = new URLSearchParams();
    if (type !== 'all') {
      params.set('type', type);
    }
    if (category && category !== 'All') {
      params.set('category', category);
    }
    if (searchQuery && searchQuery.trim().length > 0) {
      params.set('q', searchQuery.trim());
    }
    if (minPrice && minPrice > 0) {
      params.set('minPrice', String(minPrice));
    }
    if (maxPrice && maxPrice < 20000000) {
      params.set('maxPrice', String(maxPrice));
    }
    if (beds && beds > 0) {
      params.set('beds', String(beds));
    }
    if (baths && baths > 0) {
      params.set('baths', String(baths));
    }
    if (amenities && amenities.length > 0) {
      params.set('amenities', amenities.join(','));
    }

    const query = params.toString();
    return query ? `/?${query}#properties-grid` : '/#properties-grid';
  };

  const hasAnyFilter = Boolean(
    (category && category !== 'All') ||
      (searchQuery && searchQuery.trim().length > 0) ||
      (minPrice && minPrice > 0) ||
      (maxPrice && maxPrice < 20000000) ||
      (beds && beds > 0) ||
      (baths && baths > 0) ||
      (amenities && amenities.length > 0)
  );

  return (
    <section id="properties-grid" className="scroll-mt-24">
      {/* Section Header with Segmented Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-light text-nordic-dark">
              Available Properties
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-mosque/10 text-mosque">
              {totalCount} {totalCount === 1 ? 'residence' : 'residences'}
            </span>
          </div>
          <p className="text-nordic-muted mt-1 text-sm">
            Live catalog synchronized directly with Supabase database.
          </p>
        </div>

        {/* Tab switchers: All / Buy / Rent using Next.js Link for instant server navigation */}
        <div className="flex bg-white p-1 rounded-xl border border-nordic-dark/10 shadow-xs self-start sm:self-auto">
          {tabs.map((tab) => {
            const isActive = activeListingType === tab.value;
            return (
              <Link
                key={tab.value}
                href={buildTabUrl(tab.value)}
                scroll={false}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-nordic-dark text-white shadow-xs'
                    : 'text-nordic-muted hover:text-nordic-dark hover:bg-hint-green/20'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Filter Tags Bar */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white/70 rounded-xl border border-nordic-dark/10 text-xs">
          <span className="text-nordic-muted font-medium flex items-center gap-1 mr-1">
            <span className="material-icons text-sm text-mosque">tune</span> Active Filters:
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-hint-green/40 text-nordic-dark font-medium">
              Location: &ldquo;{searchQuery}&rdquo;
            </span>
          )}

          {category && category !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-hint-green/40 text-nordic-dark font-medium">
              Type: {category}
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-hint-green/40 text-nordic-dark font-medium">
              Price: {minPrice ? `$${(minPrice / 1000).toFixed(0)}k` : '$0'} –{' '}
              {maxPrice && maxPrice < 20000000
                ? `$${(maxPrice / 1000000).toFixed(1)}M`
                : '$20M+'}
            </span>
          )}

          {beds !== undefined && beds > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-hint-green/40 text-nordic-dark font-medium">
              {beds}+ Beds
            </span>
          )}

          {baths !== undefined && baths > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-hint-green/40 text-nordic-dark font-medium">
              {baths}+ Baths
            </span>
          )}

          <Link
            href="/"
            scroll={false}
            className="inline-flex items-center gap-1 ml-auto text-mosque hover:underline font-medium hover:text-nordic-dark transition-colors"
          >
            Clear all filters
          </Link>
        </div>
      )}

      {/* Property Cards Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white/80 rounded-2xl border border-nordic-dark/5 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-hint-green/40 flex items-center justify-center mx-auto mb-4 text-mosque">
            <span className="material-icons text-3xl">domain_disabled</span>
          </div>
          <h3 className="text-lg font-medium text-nordic-dark">
            No properties found
          </h3>
          <p className="text-nordic-muted text-sm mt-1 max-w-md mx-auto">
            We couldn&apos;t find any properties matching your current filters. Try
            adjusting the filters or selecting a different category.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              scroll={false}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-nordic-dark text-white text-sm font-medium rounded-lg hover:bg-mosque transition-colors"
            >
              <span className="material-icons text-sm">refresh</span>
              Reset all filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onPropertySelect}
              onFavoriteToggle={onFavoriteToggle}
            />
          ))}
        </div>
      )}

      {/* Server-Side Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        category={category}
        listingType={activeListingType}
        searchQuery={searchQuery}
        minPrice={minPrice}
        maxPrice={maxPrice}
        beds={beds}
        baths={baths}
        amenities={amenities}
      />
    </section>
  );
};
