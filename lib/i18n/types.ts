export type Locale = 'en' | 'tr';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'tr'];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'clarify_locale';

export const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇬🇧' },
  tr: { label: 'Türkçe', flag: '🇹🇷' },
};
