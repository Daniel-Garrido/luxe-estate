'use client';

import React from 'react';
import { Property } from '@/types/property';
import { FeaturedPropertyCard } from '@/components/cards/FeaturedPropertyCard';

interface FeaturedSectionProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  onViewAll?: () => void;
}

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({
  properties,
  onPropertySelect,
  onFavoriteToggle,
  onViewAll,
}) => {
  if (properties.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            Featured Collections
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            Curated properties for the discerning eye.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity cursor-pointer"
        >
          View all <span className="material-icons text-sm">arrow_forward</span>
        </button>
      </div>

      {/* Grid of 2 Featured Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((prop) => (
          <FeaturedPropertyCard
            key={prop.id}
            property={prop}
            onSelect={onPropertySelect}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    </section>
  );
};
