'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { ShoppingBag, Check } from 'lucide-react';
import { toast } from '@/components/Toast';

interface Props {
  productId: string;
  selectedSize?: string;
  disabled?: boolean;
  onBeforeAdd?: () => boolean;
}

export function AddToCartButton({ productId, selectedSize, disabled, onBeforeAdd }: Props) {
  const addToCart = useCartStore((s) => s.addToCart);
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleAdd = async () => {
    if (onBeforeAdd && !onBeforeAdd()) return;

    setState('loading');
    try {
      await addToCart(productId, 1, selectedSize);
      setState('success');
      toast('Added to your bag! 🛍️', 'success');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setState('idle');
      toast('Failed to add to bag. Please try again.', 'error');
    }
  };

  const isSuccess = state === 'success';
  const isLoading = state === 'loading';

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || isLoading || isSuccess}
      className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-wider text-sm text-white transition-all press-effect shadow-brand ${
        isSuccess
          ? 'bg-emerald-500 shadow-none'
          : disabled
          ? 'bg-stone-300 shadow-none cursor-not-allowed'
          : 'bg-gradient-to-r from-myntra-pink to-rose-600 hover:shadow-brand-lg'
      }`}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : isSuccess ? (
        <>
          <Check size={18} strokeWidth={3} />
          ADDED!
        </>
      ) : (
        <>
          <ShoppingBag size={18} />
          ADD TO BAG
        </>
      )}
    </button>
  );
}
