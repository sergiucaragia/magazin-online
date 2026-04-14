import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

type CartState = {
  items: CartItem[];
  addItem: (product: Product, size: string | null, color: string | null) => void;
  removeItem: (productId: string, size: string | null, color: string | null) => void;
  updateQuantity: (productId: string, size: string | null, color: string | null, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

// Chiave univoca per un item nel carrello (prodotto + taglia + colore)
const itemKey = (id: string, size: string | null, color: string | null) =>
  `${id}__${size ?? 'none'}__${color ?? 'none'}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, size, color) {
        const key = itemKey(product.id, size, color);
        set((state) => {
          const existing = state.items.find(
            (i) => itemKey(i.product.id, i.selected_size, i.selected_color) === key
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product.id, i.selected_size, i.selected_color) === key
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { product, quantity: 1, selected_size: size, selected_color: color }],
          };
        });
      },

      removeItem(productId, size, color) {
        const key = itemKey(productId, size, color);
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.product.id, i.selected_size, i.selected_color) !== key
          ),
        }));
      },

      updateQuantity(productId, size, color, quantity) {
        const key = itemKey(productId, size, color);
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.product.id, i.selected_size, i.selected_color) === key
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'il-mio-negozio-cart', // chiave in localStorage
    }
  )
);
