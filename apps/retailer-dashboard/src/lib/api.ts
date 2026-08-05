import { createApiFetch } from '@local-fashion/utils';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const apiFetch = createApiFetch(
  API_URL,
  'retailer_auth_token',
  'retailer_refresh_token',
  '/login'
);

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('retailer_auth_token');
}

export function setAuth(accessToken: string) {
  localStorage.setItem('retailer_auth_token', accessToken);
}

export function clearAuth() {
  localStorage.removeItem('retailer_auth_token');
}
