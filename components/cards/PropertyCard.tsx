'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  className?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onFavoriteToggle,
  className = '',
}) => {
  const [isSaved, setIsSaved] = useState(property.isSaved || false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, nextState);
    }
  };

  const isRent = property.listingType === 'rent';

  return (
    <Link
      href={`/properties/${property.slug}`}
      onClick={() => onSelect && onSelect(property)}
      className={`bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col ${className}`}
    >
      {/* Property Image with Aspect 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          alt={property.imageAlt || property.title}
          src={property.image}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Favorite Icon Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors cursor-pointer ${
            isSaved
              ? 'bg-mosque text-white shadow-sm'
              : 'bg-white/90 text-nordic-dark hover:bg-mosque hover:text-white'
          }`}
        >
          <span className="material-icons text-lg">
            {isSaved ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        {/* Badge: FOR SALE (Nordic) vs FOR RENT (Mosque) */}
        <div
          className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded tracking-wide ${
            isRent ? 'bg-mosque/90' : 'bg-nordic-dark/90'
          }`}
        >
          {property.badge || (isRent ? 'FOR RENT' : 'FOR SALE')}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            {property.formattedPrice}
            {property.pricePeriod && (
              <span className="text-sm font-normal text-nordic-muted">
                {property.pricePeriod}
              </span>
            )}
          </h3>
        </div>

        <h4 className="text-nordic-dark font-medium truncate mb-1">
          {property.title}
        </h4>
        <p className="text-nordic-muted text-xs mb-4">
          {property.location.displayLocation}
        </p>

        {/* Specs Row */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">king_bed</span>{' '}
            {property.specs.beds}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">bathtub</span>{' '}
            {property.specs.baths}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs">
            <span className="material-icons text-sm text-mosque/80">square_foot</span>{' '}
            {Number(property.specs.sqm).toLocaleString('en-US')}m²
          </div>
        </div>
      </div>
    </Link>
  );
};
