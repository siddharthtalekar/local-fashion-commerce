'use client';

import Link from 'next/link';
import { useCompareStore } from '@/store/compare';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAuthStore } from '@/store/auth';
import { ShoppingBag, Heart, Search, User, MapPin, Bell, Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useHydration } from '@/hooks/useHydration';
import { usePathname } from 'next/navigation';

const PILOT_CITY = process.env.NEXT_PUBLIC_PILOT_CITY_SLUG ?? 'pune';
const CITY_DISPLAY =
  PILOT_CITY.charAt(0).toUpperCase() + PILOT_CITY.slice(1);

export function Header() {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const wishlistCount = useWishlistStore((s) => s.wishlistIds.length);
  const user = useAuthStore((s) => s.user);
  const setLoginModalOpen = useAuthStore((s) => s.setLoginModalOpen);
  const isHydrated = useHydration();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const cartItemCount =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Hide header on full-screen pages
  const hideHeader = ['/discover'].includes(pathname);
  if (hideHeader) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-stone-100/80 shadow-md'
          : 'bg-white/95 backdrop-blur-sm border-b border-stone-100/50'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4">

        {/* Row 1: Location + Actions */}
        <div className="flex items-center justify-between py-2.5 border-b border-stone-100/60">
          {/* Location pill */}
          <Link
            href="/stores"
            className="flex items-center gap-1.5 group press-effect"
          >
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF3E6C]/20 bg-[#FF3E6C]/5"
            >
              <MapPin size={12} className="text-[#FF3E6C] flex-shrink-0 animate-pulse-brand" />
              <span className="text-xs font-black text-stone-700 leading-none">
                Exploring{' '}
                <span className="text-[#FF3E6C]">{CITY_DISPLAY}</span>
              </span>
              <svg width="10" height="10" viewBox="0 0 10 10" className="text-stone-400">
                <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-0.5">
            {/* Search - desktop only or mobile non-home pages */}
            {!['/', '/stores', '/search'].includes(pathname) && (
              <Link
                href="/search"
                className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 transition-colors text-stone-600"
              >
                <Search size={19} />
              </Link>
            )}

            {/* Notifications bell */}
            <Link
              href="/notifications"
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 transition-colors text-stone-600"
            >
              <Bell size={19} />
              {/* Unread dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3E6C] border border-white" />
            </Link>

            {/* Wishlist - desktop only */}
            <Link
              href="/wishlist"
              className="hidden md:flex relative items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 transition-colors text-stone-600"
            >
              <Heart size={19} />
              {isHydrated && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3E6C] text-[9px] font-black text-white animate-scale-in">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 transition-colors text-stone-600"
            >
              <ShoppingBag size={19} />
              {isHydrated && cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3E6C] text-[9px] font-black text-white animate-scale-in">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User avatar / login */}
            {isHydrated && user ? (
              <Link
                href="/profile"
                className="flex items-center justify-center w-9 h-9 ml-1 rounded-full text-white font-black text-sm shadow-brand flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF905A)' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center justify-center w-9 h-9 ml-1 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600 flex-shrink-0"
              >
                <User size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Search bar */}
        {['/', '/stores'].includes(pathname) && (
          <div className="py-2.5">
            <Link
              href="/search"
              className="flex items-center gap-2.5 bg-stone-100 hover:bg-stone-100/80 transition-colors rounded-2xl px-4 py-2.5 w-full"
            >
              <Search size={15} className="text-stone-400 flex-shrink-0" />
              <span className="text-sm text-stone-400 font-medium flex-1 truncate">
                Search for clothes, brands, stores...
              </span>
              {/* Mic icon */}
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF3E6C]/10 flex-shrink-0">
                <Mic size={12} className="text-[#FF3E6C]" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
