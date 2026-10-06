'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { MortgageCalculatorModal } from '@/components/property/MortgageCalculatorModal';

interface PropertyFeaturesProps {
  property: Property;
}

export const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMortgageModalOpen, setIsMortgageModalOpen] = useState(false);

  const price = property.price || 1250000;
  // Estimated payment rough starting point: ~6.5% interest on 80% loan value
  const estimatedMonthly = Math.round((price * 0.8 * 0.065) / 12);

  const defaultAmenities = [
    'Smart Home System',
    'Swimming Pool',
    'Central Heating & Cooling',
    'Electric Vehicle Charging',
    'Private Gym',
    'Wine Cellar',
  ];

  const amenities =
    property.amenities && property.amenities.length > 0
      ? property.amenities
      : defaultAmenities;

  const defaultDescription =
    property.description ||
    `Experience modern luxury in this architecturally stunning ${property.category.toLowerCase()} located in ${
      property.location.displayLocation
    }. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light.`;

  const extraDescription =
    'The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private terrace.';

  return (
    <>
      <div className="space-y-8">
        {/* 1. Property Features Grid (4 Stat Boxes) */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-mosque/5">
          <h2 className="text-lg font-semibold mb-6 text-nordic">
            Property Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Square Meters */}
            <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10 transition-transform hover:-translate-y-0.5">
              <span className="material-icons text-mosque text-2xl mb-2">
                square_foot
              </span>
              <span className="text-xl font-bold text-nordic">
                {property.specs.sqm.toLocaleString('en-US')}
              </span>
              <span className="text-xs uppercase tracking-wider text-nordic/50 text-center">
                Square Meters
              </span>
            </div>

            {/* Bedrooms */}
            <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10 transition-transform hover:-translate-y-0.5">
              <span className="material-icons text-mosque text-2xl mb-2">bed</span>
              <span className="text-xl font-bold text-nordic">
                {property.specs.beds}
              </span>
              <span className="text-xs uppercase tracking-wider text-nordic/50">
                Bedrooms
              </span>
            </div>

            {/* Bathrooms */}
            <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10 transition-transform hover:-translate-y-0.5">
              <span className="material-icons text-mosque text-2xl mb-2">shower</span>
              <span className="text-xl font-bold text-nordic">
                {property.specs.baths}
              </span>
              <span className="text-xs uppercase tracking-wider text-nordic/50">
                Bathrooms
              </span>
            </div>

            {/* Garage */}
            <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10 transition-transform hover:-translate-y-0.5">
              <span className="material-icons text-mosque text-2xl mb-2">
                directions_car
              </span>
              <span className="text-xl font-bold text-nordic">
                {property.garage || 2}
              </span>
              <span className="text-xs uppercase tracking-wider text-nordic/50">
                Garage
              </span>
            </div>
          </div>
        </div>

        {/* 2. About this Home */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-mosque/5">
          <h2 className="text-lg font-semibold mb-4 text-nordic">
            About this home
          </h2>
          <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed text-sm sm:text-base">
            <p className="mb-4">{defaultDescription}</p>
            {isExpanded && <p className="animate-in fade-in duration-300">{extraDescription}</p>}
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
          >
            {isExpanded ? 'Read less' : 'Read more'}
            <span className="material-icons text-sm">
              {isExpanded ? 'expand_less' : 'arrow_forward'}
            </span>
          </button>
        </div>

        {/* 3. Amenities */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-mosque/5">
          <h2 className="text-lg font-semibold mb-6 text-nordic">Amenities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-3 text-nordic/80 text-sm">
                <span className="material-icons text-mosque/80 text-sm">
                  check_circle
                </span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Estimated Payment Banner */}
        <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full text-mosque shadow-xs flex-shrink-0">
              <span className="material-icons text-2xl">calculate</span>
            </div>
            <div>
              <h3 className="font-semibold text-nordic">Estimated Payment</h3>
              <p className="text-sm text-nordic/60">
                Starting from{' '}
                <strong className="text-mosque font-semibold">
                  ${estimatedMonthly.toLocaleString('en-US')}/mo
                </strong>{' '}
                with 20% down
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMortgageModalOpen(true)}
            className="whitespace-nowrap px-5 py-2.5 bg-white border border-nordic/15 rounded-lg text-sm font-semibold hover:border-mosque hover:text-mosque transition-colors text-nordic cursor-pointer shadow-xs"
          >
            Calculate Mortgage
          </button>
        </div>
      </div>

      {/* Mortgage Calculator Modal */}
      <MortgageCalculatorModal
        property={property}
        isOpen={isMortgageModalOpen}
        onClose={() => setIsMortgageModalOpen(false)}
      />
    </>
  );
};
