import { useLangStore } from '@/store/language';
import { translations, genderMap } from './translations';

export function useT() {
  const lang = useLangStore((s) => s.lang);
  const t = translations[lang];

  // Translates DB gender value (Uomo/Donna/Unisex) to display string
  const tGender = (dbValue: string): string =>
    genderMap[dbValue]?.[lang] ?? dbValue;

  return { t, lang, tGender };
}
