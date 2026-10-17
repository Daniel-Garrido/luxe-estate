'use client';

import React, { useState, useTransition } from 'react';
import { setPropertyActive } from '@/app/admin/properties/actions';
import { useI18n } from '@/i18n/I18nProvider';

interface PropertyActiveToggleProps {
  propertyId: string;
  propertyTitle: string;
  isActive: boolean;
}

export const PropertyActiveToggle: React.FC<PropertyActiveToggleProps> = ({
  propertyId,
  propertyTitle,
  isActive,
}) => {
  const { dict } = useI18n();
  const t = dict.admin.properties;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const label = isPending ? t.toggling : isActive ? t.deactivate : t.activate;

  const handleClick = () => {
    setError(false);
    startTransition(async () => {
      // The action revalidates the pages, so the row picks up its new status on its own
      const result = await setPropertyActive(propertyId, !isActive);
      if (!result.ok) setError(true);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={`${label}: ${propertyTitle}`}
        title={label}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-nordic-muted transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-50 ${
          isActive ? 'hover:text-red-600 hover:bg-red-50' : 'hover:text-mosque hover:bg-hint-green/40'
        }`}
      >
        <span className={`material-icons text-xl ${isPending ? 'animate-pulse' : ''}`}>
          {isActive ? 'visibility_off' : 'restore'}
        </span>
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600 whitespace-normal">
          {t.toggleError}
        </p>
      )}
    </>
  );
};
