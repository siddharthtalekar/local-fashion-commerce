import { createApiFetch } from '@local-fashion/utils';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const apiFetch = createApiFetch(
  API_URL,
  'admin_auth_token',
  'admin_refresh_token',
  '/login'
);

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_auth_token') ?? localStorage.getItem('accessToken');
}

export function setAuth(accessToken: string) {
  localStorage.setItem('admin_auth_token', accessToken);
  localStorage.setItem('accessToken', accessToken);
}

export function clearAuth() {
  localStorage.removeItem('admin_auth_token');
  localStorage.removeItem('accessToken');
}
