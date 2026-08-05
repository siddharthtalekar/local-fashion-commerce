'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Flame, Heart, User, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { useHydration } from '@/hooks/useHydration';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Discover', href: '/discover', icon: Flame, isSpecial: true },
  { label: 'Wishlist', href: '/wishlist', icon: Heart, hasBadge: 'wishlist' as const },
  { label: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const wishlistCount = useWishlistStore((s) => s.wishlistIds.length);
  const cart = useCartStore((s) => s.cart);
  const isHydrated = useHydration();
  const [bouncingHref, setBouncingHref] = useState<string | null>(null);

  const cartCount = cart?.items?.reduce((t, i) => t + i.quantity, 0) || 0;

  const handleTap = (href: string) => {
    setBouncingHref(href);
    setTimeout(() => setBouncingHref(null), 400);
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full pb-safe md:hidden">
      {/* Glassmorphism background */}
      <div className="glass border-t border-stone-200/60 shadow-nav relative">
        <nav className="flex items-end justify-around px-2 pt-1 pb-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            
            let badgeCount = null;
            if (isHydrated) {
              if (item.hasBadge === 'wishlist' && wishlistCount > 0) badgeCount = wishlistCount;
            }
            
            const isBouncing = bouncingHref === item.href;

            if (item.isSpecial) {
              // Discover — elevated floating pill
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleTap(item.href)}
                  className="flex flex-col items-center gap-1 -mt-5 relative group"
                >
                  <div
                    className={`
                      flex items-center justify-center w-14 h-14 rounded-full shadow-brand
                      transition-all duration-300 press-effect
                      ${isBouncing ? 'animate-bounce-in' : ''}
                      ${isActive
                        ? 'scale-110'
                        : 'hover:scale-105'
                      }
                    `}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)'
                        : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                      boxShadow: isActive
                        ? '0 8px 24px rgba(255, 62, 108, 0.5), 0 2px 8px rgba(0,0,0,0.2)'
                        : '0 6px 20px rgba(0,0,0,0.25)',
                    }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={2.5}
                      className={`text-white transition-all ${isActive ? 'fill-white/30' : ''}`}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-black tracking-wide uppercase transition-colors ${
                      isActive ? 'text-[#FF3E6C]' : 'text-stone-400'
                    }`}
                  >
                    Discover
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleTap(item.href)}
                className={`
                  flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 px-1 rounded-2xl
                  transition-all duration-200 relative
                  ${isBouncing ? 'animate-tab-bounce' : ''}
                `}
              >
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <div className="relative">
                    <Icon
                      size={23}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-[#FF3E6C] fill-[#FF3E6C]/10' : 'text-stone-400'
                      }`}
                    />

                    {/* Badge */}
                    {badgeCount !== null && (
                      <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF3E6C] px-1 text-[9px] font-black text-white shadow-sm animate-scale-in">
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-black tracking-wide uppercase transition-colors ${
                      isActive ? 'text-[#FF3E6C]' : 'text-stone-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-[#FF3E6C] animate-scale-in" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
