'use client';

import React, { useState, useTransition, useId } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCategory, ListingType } from '@/types/property';
import {
  SearchFiltersModal,
  FilterValues,
} from '@/components/home/SearchFiltersModal';

interface HeroSearchProps {
  initialSearchQuery?: string;
  selectedCategory?: PropertyCategory;
  activeListingType?: ListingType;
  initialLocation?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialBeds?: number;
  initialBaths?: number;
  initialAmenities?: string[];
  onToggleFilters?: () => void;
}

const CATEGORIES: PropertyCategory[] = [
  'All',
  'House',
  'Apartment',
  'Villa',
  'Penthouse',
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  initialSearchQuery = '',
  selectedCategory = 'All',
  activeListingType = 'all',
  initialLocation = '',
  initialMinPrice,
  initialMaxPrice,
  initialBeds,
  initialBaths,
  initialAmenities,
  onToggleFilters,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialSearchQuery || initialLocation || '');
  const [optimisticCategory, setOptimisticCategory] = useState<PropertyCategory>(selectedCategory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchInputId = useId();

  // Keep optimisticCategory in sync if selectedCategory prop changes from URL
  React.useEffect(() => {
    setOptimisticCategory(selectedCategory);
  }, [selectedCategory]);

  const hasActiveCustomFilters = Boolean(
    (initialMinPrice && initialMinPrice > 0) ||
      (initialMaxPrice && initialMaxPrice < 20000000) ||
      (initialBeds && initialBeds > 0) ||
      (initialBaths && initialBaths > 0) ||
      (initialAmenities && initialAmenities.length > 0)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (activeListingType && activeListingType !== 'all') {
      params.set('type', activeListingType);
    }
    if (query.trim().length > 0) {
      params.set('q', query.trim());
    }
    if (initialMinPrice && initialMinPrice > 0) {
      params.set('minPrice', initialMinPrice.toString());
    }
    if (initialMaxPrice && initialMaxPrice < 20000000) {
      params.set('maxPrice', initialMaxPrice.toString());
    }
    if (initialBeds && initialBeds > 0) {
      params.set('beds', initialBeds.toString());
    }
    if (initialBaths && initialBaths > 0) {
      params.set('baths', initialBaths.toString());
    }

    const url = params.toString() ? `/?${params.toString()}` : '/';
    startTransition(() => {
      router.push(url);
    });
  };

  const handleApplyFilters = (filters: FilterValues) => {
    const params = new URLSearchParams();

    if (
      filters.propertyType &&
      filters.propertyType !== 'Any Type' &&
      filters.propertyType !== 'All'
    ) {
      params.set('category', filters.propertyType);
    }

    if (activeListingType && activeListingType !== 'all') {
      params.set('type', activeListingType);
    }

    const effectiveLoc = filters.location.trim();
    if (effectiveLoc.length > 0) {
      params.set('q', effectiveLoc);
      setQuery(effectiveLoc);
    } else if (query.trim().length > 0) {
      params.set('q', query.trim());
    }

    if (filters.minPrice > 0) {
      params.set('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice < 20000000) {
      params.set('maxPrice', filters.maxPrice.toString());
    }

    if (filters.beds > 0) {
      params.set('beds', filters.beds.toString());
    }

    if (filters.baths > 0) {
      params.set('baths', filters.baths.toString());
    }

    if (filters.amenities && filters.amenities.length > 0) {
      params.set('amenities', filters.amenities.join(','));
    }

    const url = params.toString()
      ? `/?${params.toString()}#properties-grid`
      : '/#properties-grid';

    startTransition(() => {
      router.push(url);
    });
  };

  const handleCategoryClick = (cat: PropertyCategory) => {
    // If clicking the current active category (and it's not All), toggle back to All
    const nextCategory: PropertyCategory =
      cat.toLowerCase() === optimisticCategory.toLowerCase() && cat !== 'All'
        ? 'All'
        : cat;

    setOptimisticCategory(nextCategory);

    const params = new URLSearchParams();
    if (nextCategory !== 'All') {
      params.set('category', nextCategory);
    }
    if (activeListingType && activeListingType !== 'all') {
      params.set('type', activeListingType);
    }
    if (query.trim().length > 0) {
      params.set('q', query.trim());
    }
    if (initialMinPrice && initialMinPrice > 0) {
      params.set('minPrice', initialMinPrice.toString());
    }
    if (initialMaxPrice && initialMaxPrice < 20000000) {
      params.set('maxPrice', initialMaxPrice.toString());
    }
    if (initialBeds && initialBeds > 0) {
      params.set('beds', initialBeds.toString());
    }
    if (initialBaths && initialBaths > 0) {
      params.set('baths', initialBaths.toString());
    }
    if (initialAmenities && initialAmenities.length > 0) {
      params.set('amenities', initialAmenities.join(','));
    }

    const queryString = params.toString();
    const targetUrl = queryString
      ? `/?${queryString}#properties-grid`
      : '/#properties-grid';

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  const handleOpenFilters = () => {
    if (onToggleFilters) {
      onToggleFilters();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-3xl mx-auto text-center space-y-7">
        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight">
          Find your{' '}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">sanctuary</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-hint-green -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        <p className="text-nordic-muted text-base md:text-lg max-w-xl mx-auto font-light">
          Explore architectural luxury homes and waterfront villas powered by Supabase.
        </p>

        {/* Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative group max-w-2xl mx-auto"
        >
          <label htmlFor={searchInputId} className="sr-only">
            Search properties by city, neighborhood, or address
          </label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span
              className={`material-icons text-2xl transition-colors ${
                isPending
                  ? 'text-mosque animate-spin'
                  : 'text-nordic-muted group-focus-within:text-mosque'
              }`}
            >
              {isPending ? 'autorenew' : 'search'}
            </span>
          </div>
          <input
            id={searchInputId}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, neighborhood, or address..."
            className="block w-full pl-12 pr-28 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:outline-none focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-base md:text-lg"
          />

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                const params = new URLSearchParams();
                if (selectedCategory && selectedCategory !== 'All') {
                  params.set('category', selectedCategory);
                }
                if (activeListingType && activeListingType !== 'all') {
                  params.set('type', activeListingType);
                }
                const url = params.toString() ? `/?${params.toString()}` : '/';
                startTransition(() => {
                  router.push(url);
                });
              }}
              aria-label="Clear search"
              className="absolute inset-y-0 right-28 flex items-center pr-2 text-nordic-muted hover:text-nordic-dark cursor-pointer"
            >
              <span className="material-icons text-lg">close</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20 cursor-pointer disabled:opacity-75"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Category Filter Pills (Chips) */}
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {CATEGORIES.map((cat) => {
            const isActive =
              optimisticCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                aria-pressed={isActive}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-nordic-dark text-white shadow-md shadow-nordic-dark/15 -translate-y-0.5'
                    : 'bg-white border border-nordic-dark/10 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <div className="w-px h-6 bg-nordic-dark/10 mx-1 flex-shrink-0" />

          {/* Filters Modal Trigger Button */}
          <button
            type="button"
            onClick={handleOpenFilters}
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-all cursor-pointer flex-shrink-0 ${
              hasActiveCustomFilters
                ? 'bg-primary text-white shadow-sm'
                : 'text-nordic-dark bg-white border border-nordic-dark/10 hover:bg-black/5'
            }`}
          >
            <span className="material-icons text-base">tune</span>
            Filters
            {hasActiveCustomFilters && (
              <span className="w-2 h-2 rounded-full bg-hint-green"></span>
            )}
          </button>
        </div>
      </div>

      {/* The Filters Modal matching design from search_filters_screen */}
      <SearchFiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeListingType={activeListingType}
        initialFilters={{
          location: query,
          propertyType: selectedCategory !== 'All' ? selectedCategory : 'Any Type',
          minPrice: initialMinPrice,
          maxPrice: initialMaxPrice,
          beds: initialBeds,
          baths: initialBaths,
          amenities: initialAmenities,
        }}
        onApplyFilters={handleApplyFilters}
      />
    </section>
  );
};

