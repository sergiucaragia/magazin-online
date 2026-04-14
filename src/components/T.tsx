'use client';

/**
 * SSR-safe translation component for use inside Server Components.
 * Always renders the 'ro' string on the server/first-render to avoid
 * hydration mismatch, then switches to the stored language after mount.
 */
import { useEffect, useState } from 'react';
import { useLangStore } from '@/store/language';
import { translations, type TranslationKey } from '@/lib/i18n/translations';

export function T({ k }: { k: TranslationKey }) {
  const lang = useLangStore((s) => s.lang);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return <>{translations[mounted ? lang : 'ro'][k]}</>;
}
