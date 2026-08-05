// Client-side URL (uses local IP so mobile devices can reach it)
const API_URL_CLIENT = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Server-side URL (uses localhost since SSR runs on the same machine as the API)
const API_URL_SERVER = process.env.API_URL_SERVER ?? 'http://localhost:4000/api';

// Export the correct URL depending on the environment
export const API_URL = typeof window === 'undefined' ? API_URL_SERVER : API_URL_CLIENT;

export const PILOT_CITY_SLUG = process.env.NEXT_PUBLIC_PILOT_CITY_SLUG ?? 'pune';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
  const { token, ...init } = options || {};

  // Always use localhost for server-side calls; use the public IP for client calls
  const baseUrl = typeof window === 'undefined' ? API_URL_SERVER : API_URL_CLIENT;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    next: { revalidate: 60 },
  });

  // Intercept 401 Unauthorized for token refresh
  if (res.status === 401 && path !== '/auth/refresh') {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('auth_refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL_CLIENT}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('auth_token', data.accessToken);
            localStorage.setItem('auth_refresh_token', data.refreshToken);
            
            // Retry original request
            headers['Authorization'] = `Bearer ${data.accessToken}`;
            res = await fetch(`${baseUrl}${path}`, {
              ...init,
              headers,
              next: { revalidate: 60 },
            });
          } else {
            // Refresh failed, clear tokens
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_refresh_token');
            window.location.reload();
            throw new Error('Session expired. Please log in again.');
          }
        } catch (e) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
          window.location.reload();
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        localStorage.removeItem('auth_token');
        window.location.reload();
        throw new Error('Session expired. Please log in again.');
      }
    }
  }

  if (!res.ok) {
    let errorMessage = `API error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
      }
    } catch {
      // Body already consumed or not JSON — use status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}
