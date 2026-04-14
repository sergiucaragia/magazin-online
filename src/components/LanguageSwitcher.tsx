'use client';

import { useLangStore, type Lang } from '@/store/language';

const LANGS: { value: Lang; label: string; flag: string }[] = [
  { value: 'ro', label: 'RO', flag: '🇷🇴' },
  { value: 'ru', label: 'RU', flag: '🇷🇺' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLangStore();

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {LANGS.map(({ value, label, flag }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            lang === value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-label={`Switch to ${label}`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
