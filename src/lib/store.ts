"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Order, Product } from "@/types";

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString();

// Seed orders so Track Order + the account dashboard work immediately.
const seedOrders: Order[] = [
  {
    id: "YT-10482",
    date: daysAgo(2),
    items: [],
    subtotal: 4498,
    shipping: 0,
    total: 4498,
    status: "In Production",
    paymentMethod: "razorpay",
    paymentId: "pay_demo10482",
    name: "Aarav Sharma",
    carrier: "BlueDart",
    tracking: "BD48120394IN",
  },
  {
    id: "YT-10391",
    date: daysAgo(14),
    items: [],
    subtotal: 1999,
    shipping: 149,
    total: 2148,
    status: "Delivered",
    paymentMethod: "cod",
    name: "Aarav Sharma",
    carrier: "Delhivery",
    tracking: "DL39104882IN",
  },
];

type CartState = {
  items: CartItem[];
  wishlist: string[];
  orders: Order[];
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
  toggleWishlist: (id: string) => void;
  addOrder: (order: Order) => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      orders: seedOrders,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === item.key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      updateQty: (key, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: Math.max(1, qty) } : i
          ),
        })),
      clear: () => set({ items: [] }),
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((w) => w !== id)
            : [...state.wishlist, id],
        })),
      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "yourtee-store",
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
      }),
    }
  )
);

export function productToCartItem(
  product: Product,
  color: string,
  size: string,
  quantity = 1
): CartItem {
  return {
    key: `${product.id}-${color}-${size}`,
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    color,
    size,
    quantity,
  };
}
