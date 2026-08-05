export function createApiFetch(
  apiUrl: string,
  tokenKey: string,
  refreshTokenKey: string,
  loginPath: string = '/login'
) {
  return async function apiFetch<T>(
    path: string,
    init?: RequestInit & { token?: string },
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    };
    if (init?.token) headers.Authorization = `Bearer ${init.token}`;

    let res = await fetch(`${apiUrl}${path}`, { ...init, headers });

    // Intercept 401 Unauthorized for token refresh
    if (res.status === 401 && path !== '/auth/refresh') {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem(refreshTokenKey);
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            
            if (refreshRes.ok) {
              const data = await refreshRes.json() as any;
              localStorage.setItem(tokenKey, data.accessToken);
              
              if (tokenKey === 'admin_auth_token') {
                localStorage.setItem('accessToken', data.accessToken); // For backwards compatibility
              }

              localStorage.setItem(refreshTokenKey, data.refreshToken);
              
              // Retry original request
              headers.Authorization = `Bearer ${data.accessToken}`;
              res = await fetch(`${apiUrl}${path}`, { ...init, headers });
            } else {
              // Refresh failed, clear tokens and redirect
              localStorage.removeItem(tokenKey);
              if (tokenKey === 'admin_auth_token') localStorage.removeItem('accessToken');
              localStorage.removeItem(refreshTokenKey);
              window.location.href = loginPath;
              throw new Error('Session expired. Please log in again.');
            }
          } catch (e) {
            localStorage.removeItem(tokenKey);
            if (tokenKey === 'admin_auth_token') localStorage.removeItem('accessToken');
            localStorage.removeItem(refreshTokenKey);
            window.location.href = loginPath;
            throw new Error('Session expired. Please log in again.');
          }
        } else {
          localStorage.removeItem(tokenKey);
          if (tokenKey === 'admin_auth_token') localStorage.removeItem('accessToken');
          window.location.href = loginPath;
          throw new Error('Session expired. Please log in again.');
        }
      }
    }

    if (!res.ok) {
      let errorMessage = `API error ${res.status}`;
      try {
        const errorData = await res.json() as any;
        if (errorData?.message) {
          errorMessage = Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message;
        }
      } catch {
        const text = await res.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }
    return res.json() as Promise<T>;
  };
}
