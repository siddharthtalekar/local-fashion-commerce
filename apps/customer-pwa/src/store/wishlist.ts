import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/lib/api';

interface WishlistState {
  wishlistIds: string[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchWishlist: (token: string) => Promise<void>;
  toggleWishlist: (productId: string, token: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],
      isLoading: false,
      hasFetched: false,
      fetchWishlist: async (token: string) => {
    if (!token) return;
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/wishlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const ids = data.map((item: any) => item.id);
        set({ wishlistIds: ids, hasFetched: true });
      } else if (res.status === 401) {
        const { useAuthStore } = await import('@/store/auth');
        useAuthStore.getState().logout();
      }
    } catch (e) {
      console.error('Failed to fetch wishlist', e);
    } finally {
      set({ isLoading: false });
    }
  },
  toggleWishlist: async (productId: string, token: string) => {
    if (!token) return;
    
    const { wishlistIds, isInWishlist } = get();
    const isCurrentlyInWishlist = isInWishlist(productId);
    
    // Optimistic update
    let newIds = [...wishlistIds];
    if (isCurrentlyInWishlist) {
      newIds = newIds.filter(id => id !== productId);
    } else {
      newIds.push(productId);
    }
    set({ wishlistIds: newIds });

    try {
      const method = isCurrentlyInWishlist ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/wishlists/${productId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          const { useAuthStore } = await import('@/store/auth');
          useAuthStore.getState().logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to toggle wishlist');
      }
    } catch (e: any) {
      console.error('Failed to toggle wishlist on server', e);
      // Revert optimistic update
      set({ wishlistIds });
      // We can optionally import toast from '@/components/Toast' and show the error,
      // but to keep it simple, we'll just revert the state so the user sees it didn't work.
    }
  },
  isInWishlist: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },
  clear: () => set({ wishlistIds: [], hasFetched: false }),
    }),
    {
      name: 'local-fashion-wishlist',
      partialize: (state) => ({ wishlistIds: state.wishlistIds }),
    }
  )
);
