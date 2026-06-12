'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { translations, type TranslationKey } from './translations';

interface I18nContextValue {
  locale: 'ar' | 'en';
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'ar',
  t: (key) => key,
});

export function I18nProvider({ locale, children }: { locale: 'ar' | 'en'; children: ReactNode }) {
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let val = translations[locale]?.[key] || translations.ar[key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          val = val.replace(`{${k}}`, String(v));
        }
      }
      return val;
    },
    [locale],
  );

  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
