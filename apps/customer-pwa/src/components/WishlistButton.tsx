'use client';

import { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useWishlistStore } from '@/store/wishlist';

interface WishlistButtonProps {
  productId: string;
}

export function WishlistButton({ productId }: WishlistButtonProps) {
  const token = useAuthStore((s) => s.token);
  const setLoginModalOpen = useAuthStore((s) => s.setLoginModalOpen);
  
  const hasFetched = useWishlistStore((s) => s.hasFetched);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const inWishlist = useWishlistStore((s) => s.wishlistIds?.includes(productId) ?? false);

  // Ensure wishlist is loaded once globally if logged in
  useEffect(() => {
    if (token && !hasFetched) {
      fetchWishlist(token);
    }
  }, [token, hasFetched, fetchWishlist]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      setLoginModalOpen(true);
      return;
    }
    
    await toggleWishlist(productId, token);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform active:scale-90`}
    >
      <Heart
        size={16}
        className={`transition-colors ${inWishlist ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-stone-900'}`}
      />
    </button>
  );
}
