'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useHydration } from '@/hooks/useHydration';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function FloatingCartPill() {
  const cart = useCartStore((s) => s.cart);
  const isHydrated = useHydration();
  const pathname = usePathname();
  const prevCountRef = useRef(0);
  const [popAnim, setPopAnim] = useState(false);

  const cartCount = cart?.items?.reduce((t, i) => t + i.quantity, 0) ?? 0;
  const cartTotal = cart?.items?.reduce((t, i) => {
    const price = i.product?.discountedPrice ?? i.product?.price ?? 0;
    return t + price * i.quantity;
  }, 0) ?? 0;

  // Pop animation when cart count increases
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setPopAnim(true);
      setTimeout(() => setPopAnim(false), 500);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  const hidePill = ['/cart', '/checkout'].includes(pathname);
  if (!isHydrated || cartCount === 0 || hidePill) return null;

  return (
    <div className="floating-cart-pill animate-float-up">
      <Link
        href="/cart"
        className={`
          flex items-center gap-3 px-5 py-3 rounded-full text-white shadow-lg press-effect
          ${popAnim ? 'animate-bounce-in' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)',
          boxShadow: '0 8px 32px rgba(255, 62, 108, 0.45), 0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Bag icon with count bubble */}
        <div className="relative">
          <ShoppingBag size={20} className="fill-white/20" />
          <span
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-[#FF3E6C] text-[10px] font-black flex items-center justify-center shadow-sm animate-scale-in"
          >
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col">
          <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest leading-none">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-white font-black text-sm leading-tight">
            ₹{cartTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1 ml-auto pl-3 border-l border-white/30">
          <span className="text-white font-black text-xs uppercase tracking-wide">View Bag</span>
          <ArrowRight size={14} className="text-white" />
        </div>
      </Link>
    </div>
  );
}
