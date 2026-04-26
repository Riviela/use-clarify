/**
 * Server-side i18n entry point.
 * Reads the locale from cookies and returns the matching dictionary.
 */
import { cookies } from 'next/headers';
import { en } from './en';
import { tr } from './tr';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
  type Locale,
} from './types';

const dictionaries: Record<Locale, typeof en> = {
  en,
  tr,
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}

/**
 * Read the user's preferred locale from the cookie store.
 * Falls back to DEFAULT_LOCALE when missing or unsupported.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const value = store.get(LOCALE_COOKIE)?.value;
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getDictionary(locale: Locale): typeof en {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export { en, tr };
export type { Locale };
export { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_COOKIE, LOCALE_META } from './types';
