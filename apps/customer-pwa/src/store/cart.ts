import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/lib/api';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: any;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      
      fetchCart: async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (token) {
            const res = await fetch(`${API_URL}/cart`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const cart = await res.json();
              set({ cart });
            }
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      },
      
      addToCart: async (productId, quantity = 1, size, color) => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (token) {
            const res = await fetch(`${API_URL}/cart/${productId}`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ quantity, size, color })
            });
            if (res.ok) {
              const cart = await res.json();
              set({ cart, isOpen: true }); // Open drawer when item added
            }
          } else {
            const { useAuthStore } = await import('./auth');
            useAuthStore.getState().setLoginModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to add to cart:', error);
        }
      },

      updateQuantity: async (cartItemId, quantity) => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (token) {
            const res = await fetch(`${API_URL}/cart/item/${cartItemId}`, {
              method: 'PATCH',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ quantity })
            });
            if (res.ok) {
              const cart = await res.json();
              set({ cart });
            }
          }
        } catch (error) {
          console.error('Failed to update cart item:', error);
        }
      },

      removeFromCart: async (cartItemId) => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (token) {
            const res = await fetch(`${API_URL}/cart/item/${cartItemId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const cart = await res.json();
              set({ cart });
            }
          }
        } catch (error) {
          console.error('Failed to remove from cart:', error);
        }
      }
    }),
    {
      name: 'local-fashion-cart',
      partialize: (state) => ({ cart: state.cart }), // Only persist the cart data
    }
  )
);
