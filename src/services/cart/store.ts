import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartRestaurantSnapshot } from '@/services/commerce/types';

export interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  restaurant: CartRestaurantSnapshot | null;
  items: CartItem[];
  setRestaurant: (restaurant: CartRestaurantSnapshot) => void;
  addItem: (restaurant: CartRestaurantSnapshot, item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  setItemQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const normalizeQuantity = (quantity: number): number => {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.min(Math.floor(quantity), 99);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurant: null,
      items: [],
      setRestaurant: (restaurant) => {
        const current = get().restaurant;
        if (!current || current.restaurantId !== restaurant.restaurantId) {
          set({ restaurant, items: [] });
          return;
        }

        set({ restaurant });
      },
      addItem: (restaurant, item, quantity = 1) => {
        const nextQuantity = normalizeQuantity(quantity);

        set((state) => {
          const incomingDifferentRestaurant =
            state.restaurant && state.restaurant.restaurantId !== restaurant.restaurantId;

          const baseItems = incomingDifferentRestaurant ? [] : state.items;
          const existing = baseItems.find((entry) => entry.menuItemId === item.menuItemId);

          const nextItems = existing
            ? baseItems.map((entry) => (
              entry.menuItemId === item.menuItemId
                ? { ...entry, quantity: normalizeQuantity(entry.quantity + nextQuantity) }
                : entry
            ))
            : [...baseItems, { ...item, quantity: nextQuantity }];

          return {
            restaurant,
            items: nextItems,
          };
        });
      },
      removeItem: (menuItemId) => {
        set((state) => {
          const nextItems = state.items.filter((item) => item.menuItemId !== menuItemId);
          return {
            restaurant: nextItems.length ? state.restaurant : null,
            items: nextItems,
          };
        });
      },
      setItemQuantity: (menuItemId, quantity) => {
        const nextQuantity = Math.max(0, Math.floor(quantity));

        set((state) => {
          if (nextQuantity <= 0) {
            const nextItems = state.items.filter((item) => item.menuItemId !== menuItemId);
            return {
              restaurant: nextItems.length ? state.restaurant : null,
              items: nextItems,
            };
          }

          return {
            items: state.items.map((item) => (
              item.menuItemId === menuItemId
                ? { ...item, quantity: normalizeQuantity(nextQuantity) }
                : item
            )),
          };
        });
      },
      clearCart: () => set({ restaurant: null, items: [] }),
    }),
    {
      name: 'tasty-cart-store',
      partialize: (state) => ({
        restaurant: state.restaurant,
        items: state.items,
      }),
    }
  )
);
