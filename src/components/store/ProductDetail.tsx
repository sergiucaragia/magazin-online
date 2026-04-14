'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { useT } from '@/lib/i18n/useT';
import type { Product } from '@/types';

export function ProductDetail({ product }: { product: Product }) {
  const { t, tGender } = useT();

  const gallery = product.images?.length > 0
    ? product.images
    : product.image_url ? [product.image_url] : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors.length === 1 ? product.colors[0] : null
  );
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const canAdd =
    product.stock > 0 &&
    (product.sizes.length === 0 || selectedSize !== null) &&
    (product.colors.length === 0 || selectedColor !== null);

  const handleAddToCart = () => {
    if (!canAdd) return;
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openCart();
  };

  const prev = () => setActiveIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setActiveIndex((i) => (i + 1) % gallery.length);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        {t.backToCatalog}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Galerie */}
        <div className="space-y-3">
          <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative">
            {gallery.length > 0 ? (
              <>
                <img
                  src={gallery[activeIndex]}
                  alt={`${product.name} — ${t.imageAlt} ${activeIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {gallery.length > 1 && (
                  <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors" aria-label={t.prevImage}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition-colors" aria-label={t.nextImage}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {gallery.map((_, i) => (
                        <button key={i} onClick={() => setActiveIndex(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-white w-4' : 'bg-white/60'}`} aria-label={`${t.goToImage} ${i + 1}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">{t.noImage}</div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {gallery.map((url, i) => (
                <button key={i} onClick={() => setActiveIndex(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeIndex ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={url} alt={`${t.thumbnail} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
              {product.category.name} · {tGender(product.gender)}
            </p>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-gray-900 mt-2">€{product.price.toFixed(2)}</p>

          {product.description && (
            <p className="text-gray-600 text-sm mt-4 leading-relaxed">{product.description}</p>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {t.size} {selectedSize && <span className="font-normal text-gray-500">— {selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-700 hover:border-gray-400'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {t.color} {selectedColor && <span className="font-normal text-gray-500">— {selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${selectedColor === color ? 'bg-black text-white border-black' : 'bg-white text-gray-700 hover:border-gray-400'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.stock === 0 && (
            <p className="mt-4 text-sm text-red-500 font-medium">{t.productOutOfStock}</p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all ${added ? 'bg-green-600 text-white' : canAdd ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {added ? (
              <><Check className="w-5 h-5" /> {t.addedToCart}</>
            ) : (
              <><ShoppingBag className="w-5 h-5" />{product.stock === 0 ? t.outOfStock : t.addToCart}</>
            )}
          </button>

          {!canAdd && product.stock > 0 && (
            <p className="text-xs text-center text-gray-400 mt-2">
              {t.select}{' '}
              {!selectedSize && product.sizes.length > 0 ? t.selectSize : ''}
              {!selectedSize && product.sizes.length > 0 && !selectedColor && product.colors.length > 0 ? t.selectAnd : ''}
              {!selectedColor && product.colors.length > 0 ? t.selectColor : ''}{' '}
              {t.selectToContinue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
