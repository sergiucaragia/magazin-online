'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { useT } from '@/lib/i18n/useT';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems)();
  const openCart = useUIStore((s) => s.openCart);
  const { t } = useT();

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 grid grid-cols-3 items-center">
        {/* Sinistra — lingua */}
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>

        {/* Centro — logo */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="font-display text-2xl italic font-light tracking-wide hover:opacity-70 transition-opacity"
            style={{ color: 'var(--ink)' }}
          >
            {t.siteTitle}
          </Link>
        </div>

        {/* Destra — carrello */}
        <div className="flex justify-end">
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 group"
            aria-label={t.openCart}
          >
            <ShoppingBag
              className="w-5 h-5 transition-opacity group-hover:opacity-60"
              style={{ color: 'var(--ink)' }}
            />
            {totalItems > 0 ? (
              <span
                className="text-sm font-medium tabular-nums"
                style={{ color: 'var(--ink)' }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}
