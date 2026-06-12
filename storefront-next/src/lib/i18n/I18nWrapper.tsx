'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';

export function I18nWrapper({ locale, children }: { locale: 'ar' | 'en'; children: ReactNode }) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
