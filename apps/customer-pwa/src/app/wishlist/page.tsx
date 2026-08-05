'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useWishlistStore } from '@/store/wishlist';
import { API_URL } from '@/lib/api';
import { Heart, Trash2, Share2, ArrowLeft } from 'lucide-react';
import type { ProductSummaryDto } from '@local-fashion/shared-types';
import { useHydration } from '@/hooks/useHydration';
import Link from 'next/link';
import { WishlistButton } from '@/components/WishlistButton';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { toast } from '@/components/Toast';

export default function WishlistPage() {
  const token = useAuthStore((s) => s.token);
  const setLoginModalOpen = useAuthStore((s) => s.setLoginModalOpen);
  const { fetchWishlist, toggleWishlist, isInWishlist } = useWishlistStore();

  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/wishlists`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            useAuthStore.getState().logout();
          }
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        fetchWishlist(token);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, fetchWishlist]);

  const handleRemove = (productId: string, name: string) => {
    if (!token) return;
    toggleWishlist(productId, token);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    toast(`Removed from wishlist`, 'info');
  };

  if (!isHydrated) return null;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[72vh] p-6 text-center animate-scale-in">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart size={52} className="text-rose-200" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-stone-900 mb-2">Your Wishlist</h2>
        <p className="text-stone-500 text-sm max-w-[240px] leading-relaxed mb-8">
          Log in to save your favourite styles and access them anytime.
        </p>
        <button
          onClick={() => setLoginModalOpen(true)}
          className="rounded-2xl bg-gradient-to-r from-myntra-pink to-rose-600 px-10 py-3.5 text-sm font-black text-white shadow-brand press-effect"
        >
          LOG IN / SIGN UP
        </button>
      </div>
    );
  }

  if (loading) return <ProductGridSkeleton count={6} />;

  return (
    <div className="pb-28 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition">
            <ArrowLeft size={20} className="text-stone-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <Heart size={20} className="text-myntra-pink fill-myntra-pink" />
              My Wishlist
            </h1>
            <p className="text-xs text-stone-500 font-medium">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-stone-100 shadow-card animate-scale-in">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-5">
            <Heart size={36} className="text-rose-200" />
          </div>
          <h2 className="text-xl font-black text-stone-900 mb-2">Nothing saved yet</h2>
          <p className="text-stone-500 text-sm max-w-[220px] mb-6 leading-relaxed">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/search"
            className="rounded-2xl bg-gradient-to-r from-myntra-pink to-rose-600 px-8 py-3 text-sm font-black text-white shadow-brand press-effect"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
            const discount = hasDiscount ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100) : 0;

            return (
              <div key={product.id} className="group">
                <div className="relative">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 mb-2.5 shadow-card group-hover:shadow-card-hover transition-shadow">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover product-img"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No Image</div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black shadow">
                          {discount}% OFF
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(product.id, product.title)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-card flex items-center justify-center text-rose-500 hover:bg-rose-50 transition press-effect"
                    title="Remove from wishlist"
                  >
                    <Heart size={14} className="fill-rose-500" />
                  </button>
                </div>

                <div className="px-0.5">
                  <p className="font-black text-stone-900 uppercase text-[11px] truncate">{product.brand.name}</p>
                  <p className="text-stone-500 text-xs font-light truncate mt-0.5">{product.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-stone-900 text-sm">₹{(product.discountedPrice ?? product.price).toLocaleString('en-IN')}</span>
                    {product.discountedPrice && (
                      <span className="text-[10px] text-stone-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  {/* Quick add to cart */}
                  <Link
                    href={`/products/${product.id}`}
                    className="mt-2 w-full flex items-center justify-center text-xs font-black text-myntra-pink border border-myntra-pink/30 rounded-xl py-1.5 hover:bg-rose-50 transition"
                  >
                    ADD TO BAG
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
