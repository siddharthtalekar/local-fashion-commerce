import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreSummaryDto } from '@local-fashion/shared-types';

interface StoreProfileState {
  myStore: StoreSummaryDto | null;
  setMyStore: (store: StoreSummaryDto | null) => void;
}

export const useStoreProfileStore = create<StoreProfileState>()(
  persist(
    (set) => ({
      myStore: null,
      setMyStore: (myStore) => set({ myStore }),
    }),
    {
      name: 'retailer-store-profile',
    }
  )
);
