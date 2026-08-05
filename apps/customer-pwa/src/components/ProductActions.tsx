'use client';

import { useState } from 'react';
import { AddToCartButton } from './AddToCartButton';
import { CompareButton } from './CompareButton';
import { Ruler, Check } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

interface Size {
  id: string;
  size: string;
  inStock: boolean;
}

interface Props {
  productId: string;
  sizes: Size[];
  colors?: string[];
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  pink: '#ec4899',
  purple: '#8b5cf6',
  gray: '#6b7280',
  navy: '#1e3a8a',
  maroon: '#7f1d1d',
  olive: '#4d7c0f',
  beige: '#f5f5dc',
  brown: '#78350f',
  mustard: '#ca8a04',
  teal: '#0d9488',
  peach: '#ffdab9',
  lavender: '#e6e6fa',
  mint: '#98ff98',
};

export function ProductActions({ productId, sizes, colors = [] }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [sizeError, setSizeError] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize && sizes.length > 0) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-5">
      {/* Colors Selector */}
      {colors.length > 0 && (
        <div>
          <p className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">
            Select Color
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const hex = COLOR_MAP[color.toLowerCase()] || '#e5e5e5';
              const isWhite = hex === '#ffffff';
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="flex flex-col items-center gap-1.5 focus:outline-none"
                  title={color}
                >
                  <div 
                    className={`w-9 h-9 rounded-full border-2 ${isSelected ? 'border-stone-900 shadow-md ring-2 ring-stone-900 ring-offset-2 scale-110' : isWhite ? 'border-stone-200' : 'border-transparent'} flex items-center justify-center transition-all`}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && <Check size={14} className={isWhite ? 'text-stone-900' : 'text-white'} />}
                  </div>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-stone-900' : 'text-stone-500'}`}>{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-black uppercase tracking-widest transition-colors ${sizeError ? 'text-rose-500 animate-shake' : 'text-stone-900'}`}>
              {sizeError ? '⚠ Please select a size' : 'Select Size'}
            </p>
            <button 
              onClick={() => setShowSizeGuide(true)}
              className="flex items-center gap-1 text-xs font-bold text-myntra-pink hover:text-rose-700 transition"
            >
              <Ruler size={12} />
              Size Chart
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (!s.inStock) return;
                  setSelectedSize(s.size);
                  setSizeError(false);
                }}
                disabled={!s.inStock}
                title={!s.inStock ? 'Out of stock' : `Size ${s.size}`}
                className={`relative flex h-11 min-w-[44px] px-3 items-center justify-center rounded-xl border text-sm font-bold transition-all press-effect ${
                  selectedSize === s.size
                    ? 'border-stone-900 bg-stone-900 text-white shadow-card ring-2 ring-stone-900 ring-offset-2'
                    : s.inStock
                    ? 'border-stone-200 text-stone-700 bg-white hover:border-stone-400 hover:bg-stone-50'
                    : 'border-stone-100 text-stone-300 bg-stone-50 cursor-not-allowed'
                }`}
              >
                {s.size}
                {!s.inStock && (
                  <span className="absolute inset-x-1 top-1/2 h-px bg-stone-300 rotate-12 pointer-events-none" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky CTA bar on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto glass border-t border-stone-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:bg-transparent md:backdrop-filter-none md:border-0 md:shadow-none px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+70px)] md:pb-0 md:p-0 md:shadow-none flex gap-3 transition-transform">
        <AddToCartButton
          productId={productId}
          selectedSize={selectedSize}
          disabled={sizes.length > 0 && !selectedSize}
          onBeforeAdd={handleAddToCart}
        />
        <div className="hidden md:block">
          <CompareButton productId={productId} />
        </div>
      </div>

      {/* Spacer for sticky bar on mobile */}
      <div className="h-32 md:hidden" />
      
      {/* Size Guide Bottom Sheet */}
      <BottomSheet 
        isOpen={showSizeGuide} 
        onClose={() => setShowSizeGuide(false)}
        title="Size Guide"
      >
        <div className="p-5">
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 mb-4">
            <h4 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> How to measure
            </h4>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              For the best fit, measure your body exactly as described. Keep the tape measure comfortably loose.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Chest</span>
                <span className="text-xs font-medium text-stone-700">Measure around fullest part</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Waist</span>
                <span className="text-xs font-medium text-stone-700">Measure natural waistline</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-hidden border border-stone-200 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-100 text-xs uppercase font-black text-stone-500">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Chest (in)</th>
                  <th className="px-4 py-3">Waist (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {['S', 'M', 'L', 'XL'].map((s, i) => (
                  <tr key={s} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-stone-900">{s}</td>
                    <td className="px-4 py-3 text-stone-600">{36 + i * 2}-{38 + i * 2}</td>
                    <td className="px-4 py-3 text-stone-600">{28 + i * 2}-{30 + i * 2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
