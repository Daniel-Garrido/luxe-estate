'use client';

import React, { useState, useTransition, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PropertyCategory, ListingType } from '@/types/property';

interface HeroSearchProps {
  initialSearchQuery?: string;
  selectedCategory?: PropertyCategory;
  activeListingType?: ListingType;
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
  onToggleFilters,
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialSearchQuery);
  const searchInputId = useId();

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
    // Always reset to page 1 on new search
    const url = params.toString() ? `/?${params.toString()}` : '/';
    startTransition(() => {
      router.push(url);
    });
  };

  const buildCategoryUrl = (cat: PropertyCategory) => {
    const params = new URLSearchParams();
    if (cat !== 'All') {
      params.set('category', cat);
    }
    if (activeListingType && activeListingType !== 'all') {
      params.set('type', activeListingType);
    }
    if (query.trim().length > 0) {
      params.set('q', query.trim());
    }
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
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
                isPending ? 'text-mosque animate-spin' : 'text-nordic-muted group-focus-within:text-mosque'
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
              className="absolute inset-y-0 right-28 flex items-center pr-2 text-nordic-muted hover:text-nordic-dark"
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

        {/* Category Filter Pills (rendered as Next.js Links for instant server navigation & prefetching) */}
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <Link
                key={cat}
                href={buildCategoryUrl(cat)}
                scroll={false}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-nordic-dark text-white shadow-md shadow-nordic-dark/15 hover:-translate-y-0.5'
                    : 'bg-white border border-nordic-dark/10 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5'
                }`}
              >
                {cat}
              </Link>
            );
          })}

          <div className="w-px h-6 bg-nordic-dark/10 mx-1 flex-shrink-0" />

          <button
            type="button"
            onClick={onToggleFilters}
            className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm hover:bg-black/5 transition-colors cursor-pointer flex-shrink-0"
          >
            <span className="material-icons text-base">tune</span> Filters
          </button>
        </div>
      </div>
    </section>
  );
};
