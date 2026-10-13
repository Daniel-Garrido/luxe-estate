'use client';

import React, { createContext, useContext } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<
  I18nContextValue & { children: React.ReactNode }
> = ({ locale, dict, children }) => (
  <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>
);

// Access the current locale and dictionary from Client Components
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
