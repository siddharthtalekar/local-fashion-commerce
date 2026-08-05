import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AdminUser | null;
  setAuth: (token: string, refreshToken: string, user: AdminUser) => void;
  logout: () => void;
}

const STORAGE_KEY = 'admin_auth_token';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, token);
          localStorage.setItem('admin_refresh_token', refreshToken);
          localStorage.setItem('accessToken', token);
        }
        set({ token, refreshToken, user });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('accessToken');
        }
        set({ token: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
    }
  )
);
