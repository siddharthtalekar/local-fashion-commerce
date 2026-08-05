'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  productIds: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isInCompare: (id: string) => boolean;
}

const MAX_COMPARE = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],
      add: (id) =>
        set((state) => {
          if (state.productIds.includes(id)) return state;
          if (state.productIds.length >= MAX_COMPARE) return state;
          return { productIds: [...state.productIds, id] };
        }),
      remove: (id) =>
        set((state) => ({ productIds: state.productIds.filter((p) => p !== id) })),
      toggle: (id) => {
        const { productIds, add, remove } = get();
        if (productIds.includes(id)) remove(id);
        else add(id);
      },
      clear: () => set({ productIds: [] }),
      isInCompare: (id) => get().productIds.includes(id),
    }),
    { name: 'compare-storage' },
  ),
);
