'use client';

import React from 'react';
import { Property } from '@/types/property';
import { FeaturedPropertyCard } from '@/components/cards/FeaturedPropertyCard';
import { useI18n } from '@/i18n/I18nProvider';

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
  const { dict } = useI18n();
  const displayProperties = properties.slice(0, 2);
  if (displayProperties.length === 0) return null;

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-nordic-dark">
            {dict.featured.title}
          </h2>
          <p className="text-nordic-muted mt-1 text-sm">
            {dict.featured.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity cursor-pointer"
        >
          {dict.featured.viewAll} <span className="material-icons text-sm">arrow_forward</span>
        </button>
      </div>

      {/* Grid of exactly 2 Featured Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {displayProperties.map((prop) => (
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
