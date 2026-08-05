'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Check, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';

interface Size {
  id: string;
  size: string;
  inStock: boolean;
}

interface QuickAddSheetProps {
  product: {
    id: string;
    title: string;
    brand: string;
    price: number;
    discountedPrice?: number | null;
    image?: string;
    sizes: Size[];
  };
  onClose: () => void;
}

const FASHION_FALLBACK = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80&auto=format&fit=crop';

export function QuickAddSheet({ product, onClose }: QuickAddSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent background scrolling when sheet is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [sizeError, setSizeError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  const displayPrice = product.discountedPrice ?? product.price;
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;
  const discount = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  const handleAdd = async () => {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    setAdding(true);
    await addToCart(product.id, 1, selectedSize);
    setAdding(false);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-lg bottom-sheet-enter max-h-[75dvh] flex flex-col overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
        >
          <X size={16} />
        </button>

        {/* Product preview */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-stone-100">
          <div className="w-16 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
            <img
              src={product.image || FASHION_FALLBACK}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest truncate">
              {product.brand}
            </p>
            <p className="text-sm font-semibold text-stone-900 leading-tight mt-0.5 line-clamp-2">
              {product.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-black text-stone-900 text-base">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs text-stone-400 line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="badge-hot">{discount}% OFF</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Size Selector */}
        <div className="px-5 py-4 flex-1 overflow-y-auto">
          {product.sizes.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${
                    sizeError ? 'text-rose-500' : 'text-stone-700'
                  }`}
                >
                  {sizeError ? (
                    <span className="flex items-center gap-1.5 animate-slide-up">
                      <AlertCircle size={12} /> Select a size first
                    </span>
                  ) : (
                    'Select Size'
                  )}
                </p>
                <button 
                  className="flex items-center gap-1 text-xs font-bold text-myntra-pink hover:text-rose-700 transition"
                  onClick={() => {
                    // Quick alert for now, you could also open the same BottomSheet as ProductActions
                    alert('Size Guide: S (36-38"), M (38-40"), L (40-42")');
                  }}
                >
                  Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    disabled={!s.inStock}
                    onClick={() => {
                      if (!s.inStock) return;
                      setSelectedSize(s.size);
                      setSizeError(false);
                    }}
                    className={`
                      relative flex h-12 min-w-[52px] px-4 items-center justify-center rounded-2xl border text-sm font-bold
                      transition-all duration-200 press-effect
                      ${selectedSize === s.size
                        ? 'border-[#FF3E6C] bg-[#FF3E6C] text-white shadow-brand scale-105'
                        : s.inStock
                        ? 'border-stone-200 text-stone-700 bg-white hover:border-stone-400'
                        : 'border-stone-100 text-stone-300 bg-stone-50 cursor-not-allowed'
                      }
                    `}
                  >
                    {s.size}
                    {!s.inStock && (
                      <span className="absolute inset-x-2 top-1/2 h-px bg-stone-200 -rotate-12 pointer-events-none" />
                    )}
                    {selectedSize === s.size && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF3E6C] border-2 border-white flex items-center justify-center">
                        <Check size={8} className="text-white stroke-[3]" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500 text-center py-2">One size available</p>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pb-6 pt-3 border-t border-stone-100 pb-safe">
          <button
            onClick={handleAdd}
            disabled={adding || added}
            className={`
              w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3
              transition-all duration-300 press-effect
              ${added
                ? 'bg-emerald-500 text-white shadow-lg scale-[0.98]'
                : 'text-white shadow-brand active:scale-[0.97]'
              }
            `}
            style={!added ? {
              background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)',
              boxShadow: '0 8px 24px rgba(255, 62, 108, 0.35)',
            } : {}}
          >
            {adding ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Adding...
              </>
            ) : added ? (
              <>
                <Check size={20} className="stroke-[3]" />
                Added to Bag!
              </>
            ) : (
              <>
                <ShoppingBag size={20} />
                Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
