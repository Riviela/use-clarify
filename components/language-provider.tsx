'use client';

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@/lib/i18n/en';
import { tr } from '@/lib/i18n/tr';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
} from '@/lib/i18n/types';

type Dict = typeof en;

interface LanguageContextValue {
  locale: Locale;
  dict: Dict;
  setLocale: (next: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const dictionaries: Record<Locale, Dict> = { en, tr };

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  initialLocale: Locale;
  children: React.ReactNode;
}

/**
 * Resolve a dot-separated key from the dictionary tree.
 * E.g. resolvePath(dict, 'navbar.detector') -> dict.navbar.detector
 */
function resolvePath(dict: unknown, path: string): string | undefined {
  const segments = path.split('.');
  let cur: unknown = dict;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

/**
 * Replace `{var}` placeholders in a translation string.
 */
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function LanguageProvider({ initialLocale, children }: LanguageProviderProps) {
  const router = useRouter();

  // We don't keep `locale` in React state — instead each switch sets a cookie
  // and reloads the route so SSR can re-render with the new dictionary.
  // This avoids hydration mismatches.
  const locale: Locale = initialLocale;
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

  const setLocale = useCallback(
    (next: Locale) => {
      // Persist for ~1 year. SameSite=Lax so OAuth redirects keep it.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      // Reload the current route so all server components re-render with the new dict.
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (path: string, vars?: Record<string, string | number>): string => {
      const value = resolvePath(dict, path);
      if (value === undefined) {
        // Soft fallback: try English, otherwise return the key
        const fallback = resolvePath(dictionaries[DEFAULT_LOCALE], path);
        return interpolate(fallback ?? path, vars);
      }
      return interpolate(value, vars);
    },
    [dict]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, dict, setLocale, t }),
    [locale, dict, setLocale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a <LanguageProvider>');
  }
  return ctx;
}
