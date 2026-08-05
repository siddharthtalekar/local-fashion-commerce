import { create } from 'zustand';
import { API_URL } from '@/lib/api';
import { useCartStore } from './cart';

interface OrderState {
  isProcessing: boolean;
  placeOrder: (addressId?: string, paymentMethod?: string) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set) => ({
  isProcessing: false,
  
  placeOrder: async (addressId, paymentMethod) => {
    set({ isProcessing: true });
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addressId, paymentMethod })
      });

      if (res.ok) {
        // Refresh the cart after successful checkout to clear it on the client
        await useCartStore.getState().fetchCart();
        set({ isProcessing: false });
        return true;
      }
      
      set({ isProcessing: false });
      return false;
    } catch (error) {
      console.error('Failed to place order:', error);
      set({ isProcessing: false });
      return false;
    }
  }
}));
