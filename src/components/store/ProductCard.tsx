'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n/useT';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { t, tGender } = useT();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl overflow-hidden border hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            {t.noImage}
          </div>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
            {t.outOfStock}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{tGender(product.gender)}</p>
        <h3 className="font-medium text-gray-900 mt-0.5 truncate">{product.name}</h3>
        <p className="text-sm font-semibold text-gray-900 mt-1">€{product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
