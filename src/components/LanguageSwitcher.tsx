'use client';

import { useLangStore, type Lang } from '@/store/language';

const LANGS: { value: Lang; label: string }[] = [
  { value: 'ro', label: 'RO' },
  { value: 'ru', label: 'RU' },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useLangStore();

  return (
    <div className="flex items-center gap-1">
      {LANGS.map(({ value, label }, i) => (
        <span key={value} className="flex items-center gap-1">
          <button
            onClick={() => setLang(value)}
            className="text-xs font-semibold tracking-wider transition-opacity"
            style={{
              color: lang === value ? 'var(--ink)' : 'var(--muted)',
              opacity: lang === value ? 1 : 0.5,
            }}
            aria-label={`Switch to ${label}`}
          >
            {label}
          </button>
          {i < LANGS.length - 1 && (
            <span className="text-xs" style={{ color: 'var(--border)' }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
}
