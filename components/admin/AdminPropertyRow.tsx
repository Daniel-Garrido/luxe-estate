import React from 'react';
import Link from 'next/link';
import type { Property } from '@/types/property';
import type { Dictionary } from '@/i18n/dictionaries';
import { format } from '@/i18n/format';

interface AdminPropertyRowProps {
  property: Property;
  dict: Dictionary;
}

export const AdminPropertyRow: React.FC<AdminPropertyRowProps> = ({ property, dict }) => {
  const t = dict.admin.properties;
  const isRent = property.listingType === 'rent';
  const cover = property.images[0];

  return (
    <tr className="border-t border-nordic-dark/5 hover:bg-clear-day/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-clear-day flex items-center justify-center">
            {cover ? (
              // Plain <img>: property photos come from several hosts
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={property.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="material-icons text-nordic-muted">image</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-nordic truncate">{property.title}</p>
              {property.isFeatured && (
                <span className="material-icons text-base text-amber-500" title={t.featured}>
                  star
                </span>
              )}
            </div>
            <p className="text-sm text-nordic-muted truncate">{property.location.displayLocation}</p>
            <p className="text-xs text-nordic-muted/80 mt-1">
              {dict.categories[property.category]} ·{' '}
              {format(t.specs, {
                beds: property.specs.beds,
                baths: property.specs.baths,
                sqm: property.specs.sqm.toLocaleString(),
              })}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="font-semibold text-nordic">
          {property.formattedPrice}
          {property.pricePeriod && (
            <span className="text-sm font-normal text-nordic-muted">{property.pricePeriod}</span>
          )}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isRent ? 'bg-orange-50 text-orange-700' : 'bg-hint-green text-mosque'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isRent ? 'bg-orange-500' : 'bg-mosque'}`} />
          {isRent ? dict.listing.forRent : dict.listing.forSale}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <Link
          href={`/properties/${property.slug}`}
          target="_blank"
          aria-label={`${t.view}: ${property.title}`}
          title={t.view}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-nordic-muted hover:text-mosque hover:bg-hint-green/40 transition-colors"
        >
          <span className="material-icons text-xl">visibility</span>
        </Link>
      </td>
    </tr>
  );
};
