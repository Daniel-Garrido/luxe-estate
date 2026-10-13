// Central i18n configuration.
// To add a new language:
//   1. Create `i18n/locales/<code>.json` (copy `en.json` and translate the values).
//   2. Add the code to `locales`, its label to `localeNames` and its loader in `i18n/dictionaries.ts`.

export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

// One year, in seconds
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const isLocale = (value: string | undefined | null): value is Locale =>
  !!value && (locales as readonly string[]).includes(value);

// Picks the best supported locale from an Accept-Language header,
// e.g. "es-MX,es;q=0.9,en;q=0.8" -> "es"
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const preferred = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return {
        base: tag.toLowerCase().split('-')[0],
        q: q ? parseFloat(q.trim().slice(2)) || 0 : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { base } of preferred) {
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
