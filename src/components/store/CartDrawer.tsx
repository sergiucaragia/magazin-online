'use client';

import Link from 'next/link';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useCartStore } from '@/store/cart';
import { useT } from '@/lib/i18n/useT';

export function CartDrawer() {
  const isOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const { t } = useT();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50" onClick={closeCart} aria-hidden="true" />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label={t.cart}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">{t.cart}</h2>
          <button onClick={closeCart} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
            <ShoppingBag className="w-12 h-12" />
            <p>{t.cartEmpty}</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y px-4">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.selected_size}-${item.selected_color}`}
                  className="py-4 flex gap-3"
                >
                  {item.product.image_url && (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[item.selected_size, item.selected_color].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selected_size, item.selected_color, item.quantity - 1)}
                        className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-gray-100"
                      >−</button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selected_size, item.selected_color, item.quantity + 1)}
                        className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-gray-100"
                      >+</button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.selected_size, item.selected_color)}
                    className="p-1 text-gray-400 hover:text-red-500 self-start"
                    aria-label={t.remove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t px-4 py-4 space-y-3">
              <div className="flex justify-between font-semibold text-base">
                <span>{t.total}</span>
                <span>€{totalPrice().toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-black text-white text-center py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                {t.checkout}
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
