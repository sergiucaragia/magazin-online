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
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          {t.siteTitle}
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <button
            onClick={openCart}
            className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label={t.openCart}
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
