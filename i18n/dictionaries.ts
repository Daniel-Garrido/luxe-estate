// Server-only: uses next/headers, so importing it from a Client Component fails at build time
import { cookies, headers } from 'next/headers';
import {
  Locale,
  LOCALE_COOKIE,
  isLocale,
  matchLocale,
} from '@/i18n/config';
import type es from '@/i18n/locales/es.json';

// Every locale file must have the same shape as es.json (enforced by the type below)
export type Dictionary = typeof es;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import('./locales/es.json').then((m) => m.default),
  en: () => import('./locales/en.json').then((m) => m.default),
};

// Reads the user's locale from the cookie (written by proxy.ts or the language switcher),
// falling back to the browser's Accept-Language header.
export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  return matchLocale((await headers()).get('accept-language'));
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())]();
}
