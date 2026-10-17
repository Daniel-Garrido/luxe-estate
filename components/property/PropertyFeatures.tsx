'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { MortgageCalculatorModal } from '@/components/property/MortgageCalculatorModal';
import { FormattedDescription } from '@/components/property/FormattedDescription';
import { useI18n } from '@/i18n/I18nProvider';
import { format, formatRich } from '@/i18n/format';

interface PropertyFeaturesProps {
  property: Property;
}

export const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({ property }) => {
  const { dict } = useI18n();
  const t = dict.property.features;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMortgageModalOpen, setIsMortgageModalOpen] = useState(false);

  const price = property.price || 1250000;
  // Estimated payment rough starting point: ~6.5% interest on 80% loan value
  const estimatedMonthly = Math.round((price * 0.8 * 0.065) / 12);

  const amenityList: Record<string, string> = t.amenityList;
  // Chosen in the admin property form; the section is hidden when there are none
  const amenities = property.amenities ?? [];

  const defaultDescription =
    property.description ||
    format(t.defaultDescription, {
      category: dict.categories[property.category].toLowerCase(),
      location: property.location.displayLocation,
    });

  return (
    <>
      <div className="space-y-8">
        {/* 1. Property Features Grid (4 Stat Boxes) */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-mosque/5">
          <h2 className="text-lg font-semibold mb-6 text-nordic">
            {t.title}
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
                {t.sqm}
              </span>
            </div>

            {/* Bedrooms */}
            <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10 transition-transform hover:-translate-y-0.5">
              <span className="material-icons text-mosque text-2xl mb-2">bed</span>
              <span className="text-xl font-bold text-nordic">
                {property.specs.beds}
              </span>
              <span className="text-xs uppercase tracking-wider text-nordic/50">
                {t.bedrooms}
              </span>
            </div>

            {/* Bathrooms */}
            <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10 transition-transform hover:-translate-y-0.5">
              <span className="material-icons text-mosque text-2xl mb-2">shower</span>
              <span className="text-xl font-bold text-nordic">
                {property.specs.baths}
              </span>
              <span className="text-xs uppercase tracking-wider text-nordic/50">
                {t.bathrooms}
              </span>
            </div>

            {/* Garage */}
            <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10 transition-transform hover:-translate-y-0.5">
              <span className="material-icons text-mosque text-2xl mb-2">
                directions_car
              </span>
              <span className="text-xl font-bold text-nordic">
                {property.garage ?? 0}
              </span>
              <span className="text-xs uppercase tracking-wider text-nordic/50">
                {t.garage}
              </span>
            </div>
          </div>
        </div>

        {/* 2. About this Home */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-mosque/5">
          <h2 className="text-lg font-semibold mb-4 text-nordic">
            {t.about}
          </h2>
          <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed text-sm sm:text-base">
            <FormattedDescription text={defaultDescription} />
            {isExpanded && <p className="animate-in fade-in duration-300">{t.extraDescription}</p>}
          </div>
          {/* The generic extra text only completes the placeholder description */}
          {!property.description && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            >
              {isExpanded ? t.readLess : t.readMore}
              <span className="material-icons text-sm">
                {isExpanded ? 'expand_less' : 'arrow_forward'}
              </span>
            </button>
          )}
        </div>

        {/* 3. Amenities */}
        {amenities.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-mosque/5">
            <h2 className="text-lg font-semibold mb-6 text-nordic">{t.amenities}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 text-nordic/80 text-sm">
                  <span className="material-icons text-mosque/80 text-sm">
                    check_circle
                  </span>
                  {/* Known keys are translated; free text from the database is shown as-is */}
                  <span>{amenityList[amenity] ?? amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Estimated Payment Banner */}
        <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full text-mosque shadow-xs flex-shrink-0">
              <span className="material-icons text-2xl">calculate</span>
            </div>
            <div>
              <h3 className="font-semibold text-nordic">{t.estimatedPayment}</h3>
              <p className="text-sm text-nordic/60">
                {formatRich(t.startingFrom, {
                  amount: (
                    <strong className="text-mosque font-semibold">
                      ${estimatedMonthly.toLocaleString('en-US')}
                      {dict.property.mortgage.perMonth}
                    </strong>
                  ),
                })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMortgageModalOpen(true)}
            className="whitespace-nowrap px-5 py-2.5 bg-white border border-nordic/15 rounded-lg text-sm font-semibold hover:border-mosque hover:text-mosque transition-colors text-nordic cursor-pointer shadow-xs"
          >
            {t.calculateMortgage}
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
