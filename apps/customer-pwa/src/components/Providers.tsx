'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '@/store/auth';
import { useWishlistStore } from '@/store/wishlist';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const token = useAuthStore((s) => s.token);
  const { fetchWishlist, hasFetched } = useWishlistStore();

  useEffect(() => {
    if (token && !hasFetched) {
      fetchWishlist(token);
    }
  }, [token, hasFetched, fetchWishlist]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <AuthModal />
    </QueryClientProvider>
  );
}
