import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RetailerUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: RetailerUser | null;
  setAuth: (token: string, refreshToken: string, user: RetailerUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('retailer_auth_token', token);
          localStorage.setItem('retailer_refresh_token', refreshToken);
        }
        set({ token, refreshToken, user });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('retailer_auth_token');
          localStorage.removeItem('retailer_refresh_token');
        }
        set({ token: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'retailer-auth-storage',
    }
  )
);
