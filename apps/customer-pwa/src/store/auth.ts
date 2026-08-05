import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoginModalOpen: false,
      setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      setAuth: (token, refreshToken, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_refresh_token', refreshToken);
        }
        set({ token, refreshToken, user, isLoginModalOpen: false });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
        }
        set({ token: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'local-fashion-auth',
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
    }
  )
);
