'use client';

import React, { useState, useEffect, useId, useCallback } from 'react';
import { getPropertyFilterCount } from '@/lib/supabase';
import { PropertyCategory, ListingType } from '@/types/property';
import { useI18n } from '@/i18n/I18nProvider';
import { plural } from '@/i18n/format';

export interface FilterValues {
  location: string;
  minPrice: number;
  maxPrice: number;
  propertyType: string;
  beds: number;
  baths: number;
  amenities: string[];
}

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: Partial<FilterValues>;
  activeListingType?: ListingType;
  onApplyFilters: (filters: FilterValues) => void;
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 20000000;
const PRICE_STEP = 100000;

const AMENITY_OPTIONS = [
  { id: 'pool', icon: 'pool' },
  { id: 'gym', icon: 'fitness_center' },
  { id: 'parking', icon: 'local_parking' },
  { id: 'ac', icon: 'ac_unit' },
  { id: 'wifi', icon: 'wifi' },
  { id: 'patio', icon: 'deck' },
] as const;

function formatPriceDisplay(amount: number): string {
  if (amount >= 1000000) {
    const millions = (amount / 1000000).toFixed(1).replace('.0', '');
    return `$${millions}M`;
  }
  if (amount >= 1000) {
    const thousands = (amount / 1000).toFixed(0);
    return `$${thousands}K`;
  }
  return `$${amount.toLocaleString('en-US')}`;
}

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  isOpen,
  onClose,
  initialFilters,
  activeListingType = 'all',
  onApplyFilters,
}) => {
  const { dict } = useI18n();
  const t = dict.filters;
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [minPrice, setMinPrice] = useState(
    initialFilters?.minPrice !== undefined ? initialFilters.minPrice : DEFAULT_MIN_PRICE
  );
  const [maxPrice, setMaxPrice] = useState(
    initialFilters?.maxPrice !== undefined ? initialFilters.maxPrice : DEFAULT_MAX_PRICE
  );
  const [propertyType, setPropertyType] = useState(initialFilters?.propertyType || 'Any Type');
  const [beds, setBeds] = useState(initialFilters?.beds || 0);
  const [baths, setBaths] = useState(initialFilters?.baths || 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters?.amenities || ['pool', 'wifi']
  );

  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Sync state if initialFilters changes
  useEffect(() => {
    if (isOpen) {
      setLocation(initialFilters?.location || '');
      setMinPrice(initialFilters?.minPrice !== undefined ? initialFilters.minPrice : DEFAULT_MIN_PRICE);
      setMaxPrice(initialFilters?.maxPrice !== undefined ? initialFilters.maxPrice : DEFAULT_MAX_PRICE);
      setPropertyType(initialFilters?.propertyType || 'Any Type');
      setBeds(initialFilters?.beds || 0);
      setBaths(initialFilters?.baths || 0);
      if (initialFilters?.amenities) {
        setSelectedAmenities(initialFilters.amenities);
      }
    }
  }, [isOpen, initialFilters]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Query live count for button
  const fetchMatchingCount = useCallback(async () => {
    setIsLoadingCount(true);
    try {
      const count = await getPropertyFilterCount({
        category: propertyType !== 'Any Type' ? (propertyType as PropertyCategory) : 'All',
        listingType: activeListingType,
        location: location.trim(),
        minPrice: minPrice > DEFAULT_MIN_PRICE ? minPrice : undefined,
        maxPrice: maxPrice < DEFAULT_MAX_PRICE ? maxPrice : undefined,
        minBeds: beds > 0 ? beds : undefined,
        minBaths: baths > 0 ? baths : undefined,
      });
      setMatchingCount(count);
    } catch {
      setMatchingCount(null);
    } finally {
      setIsLoadingCount(false);
    }
  }, [propertyType, activeListingType, location, minPrice, maxPrice, beds, baths]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchMatchingCount();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchMatchingCount]);

  if (!isOpen) return null;

  const minPercent = Math.min(100, Math.max(0, (minPrice / DEFAULT_MAX_PRICE) * 100));
  const maxPercent = Math.min(100, Math.max(0, (maxPrice / DEFAULT_MAX_PRICE) * 100));

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPrice - PRICE_STEP);
    setMinPrice(Math.max(0, val));
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPrice + PRICE_STEP);
    setMaxPrice(Math.min(DEFAULT_MAX_PRICE, val));
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    setMinPrice(num);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal ? parseInt(rawVal, 10) : DEFAULT_MAX_PRICE;
    setMaxPrice(num);
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearAll = () => {
    setLocation('');
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setPropertyType('Any Type');
    setBeds(0);
    setBaths(0);
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApplyFilters({
      location,
      minPrice,
      maxPrice,
      propertyType,
      beds,
      baths,
      amenities: selectedAmenities,
    });
    onClose();
  };

  const priceRangeSummary =
    minPrice === DEFAULT_MIN_PRICE && maxPrice === DEFAULT_MAX_PRICE
      ? t.anyPrice
      : `${formatPriceDisplay(minPrice)} – ${formatPriceDisplay(maxPrice)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Image Layer to simulate app context matching design */}
      <div
        className="fixed inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-10 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Container */}
      <main className="relative z-20 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-800 dark:text-gray-100 font-display animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-30">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
            aria-label={t.close}
          >
            <span className="material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
          {/* Section 1: Location */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t.location}
            </label>
            <div className="relative group">
              <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors">
                location_on
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-background-light dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 transition-all shadow-xs"
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t.priceRange}
              </label>
              <span className="text-sm font-medium text-primary">
                {priceRangeSummary}
              </span>
            </div>

            {/* Interactive Dual Slider */}
            <div className="relative h-12 flex items-center mb-6 px-2">
              {/* Slider Track Background */}
              <div className="absolute left-2 right-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-75"
                  style={{
                    marginLeft: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />
              </div>

              {/* Min Range Slider */}
              <input
                type="range"
                min={DEFAULT_MIN_PRICE}
                max={DEFAULT_MAX_PRICE}
                step={PRICE_STEP}
                value={minPrice}
                onChange={handleMinSliderChange}
                aria-label={t.minPriceAria}
                className="filter-range-slider absolute left-2 right-2 w-[calc(100%-16px)] h-1 bg-transparent appearance-none pointer-events-none z-20 cursor-pointer"
              />

              {/* Max Range Slider */}
              <input
                type="range"
                min={DEFAULT_MIN_PRICE}
                max={DEFAULT_MAX_PRICE}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={handleMaxSliderChange}
                aria-label={t.maxPriceAria}
                className="filter-range-slider absolute left-2 right-2 w-[calc(100%-16px)] h-1 bg-transparent appearance-none pointer-events-none z-20 cursor-pointer"
              />
            </div>

            {/* Price Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-light dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-primary/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  {t.minPrice}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={minPrice.toLocaleString('en-US')}
                    onChange={handleMinInputChange}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-background-light dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-primary/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  {t.maxPrice}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={maxPrice.toLocaleString('en-US')}
                    onChange={handleMaxInputChange}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Type Dropdown */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t.propertyType}
              </label>
              <div className="relative">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-background-light dark:bg-gray-800 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="Any Type">{t.anyType}</option>
                  <option value="House">{dict.categories.House}</option>
                  <option value="Apartment">{dict.categories.Apartment}</option>
                  <option value="Villa">{dict.categories.Villa}</option>
                  <option value="Penthouse">{dict.categories.Penthouse}</option>
                </select>
                <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Rooms: Beds & Baths counters */}
            <div className="space-y-4">
              {/* Bedrooms */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t.bedrooms}
                </span>
                <div className="flex items-center space-x-3 bg-background-light dark:bg-gray-800 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setBeds((b) => Math.max(0, b - 1))}
                    disabled={beds === 0}
                    aria-label={t.decreaseBedrooms}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-xs flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-8 text-center text-gray-900 dark:text-white">
                    {beds === 0 ? t.any : `${beds}+`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBeds((b) => Math.min(10, b + 1))}
                    aria-label={t.increaseBedrooms}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-xs flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t.bathrooms}
                </span>
                <div className="flex items-center space-x-3 bg-background-light dark:bg-gray-800 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setBaths((b) => Math.max(0, b - 1))}
                    disabled={baths === 0}
                    aria-label={t.decreaseBathrooms}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-xs flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-8 text-center text-gray-900 dark:text-white">
                    {baths === 0 ? t.any : `${baths}+`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBaths((b) => Math.min(10, b + 1))}
                    aria-label={t.increaseBathrooms}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-xs flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities & Features */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {t.amenities}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isActive = selectedAmenities.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    className="cursor-pointer group relative block select-none"
                    onClick={() => toggleAmenity(amenity.id)}
                  >
                    <div
                      className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${
                        isActive
                          ? 'border-primary bg-primary/5 dark:bg-primary/20 text-primary font-medium hover:bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span
                        className={`material-icons text-lg ${
                          isActive
                            ? 'text-primary'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      >
                        {amenity.icon}
                      </span>
                      {t.amenityOptions[amenity.id]}
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full opacity-100 transition-opacity" />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors underline decoration-gray-300 underline-offset-4 cursor-pointer"
          >
            {t.clearAll}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 flex items-center gap-2 transform active:scale-95 cursor-pointer"
          >
            {isLoadingCount
              ? t.loading
              : matchingCount !== null
              ? plural(matchingCount, t.showCount)
              : t.showHomes}
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </footer>
      </main>
    </div>
  );
};
