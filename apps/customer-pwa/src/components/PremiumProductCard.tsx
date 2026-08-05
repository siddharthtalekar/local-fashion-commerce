'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { ProductSummaryDto } from '@local-fashion/shared-types';
import { WishlistButton } from '@/components/WishlistButton';
import { QuickAddSheet } from '@/components/QuickAddSheet';

const FASHION_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571513722275-4ad2f7c3ac1b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80&auto=format&fit=crop',
];

export function getProductImg(p: ProductSummaryDto, index: number): string {
  return p.images?.[0]?.url || FASHION_PRODUCT_IMAGES[index % FASHION_PRODUCT_IMAGES.length];
}

interface PremiumProductCardProps {
  product: ProductSummaryDto;
  index: number;
  listView?: boolean;
  priority?: boolean;
  className?: string;
  imageContainerClassName?: string;
}

export function PremiumProductCard({
  product: p,
  index,
  listView,
  className = '',
  imageContainerClassName = 'aspect-[4/5]',
}: PremiumProductCardProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const hasDiscount = p.discountedPrice && p.discountedPrice < p.price;
  const displayPrice = p.discountedPrice ?? p.price;
  const discount = hasDiscount ? Math.round(((p.price - p.discountedPrice!) / p.price) * 100) : 0;
  const imgUrl = getProductImg(p, index);

  if (listView) {
    return (
      <>
        <div className={`flex gap-3 bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-shadow press-effect ${className}`}>
          <Link href={`/products/${p.id}`} className={`w-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 relative ${imageContainerClassName}`}>
            <img src={imgUrl} alt={p.title} className="absolute inset-0 w-full h-full object-cover product-img" />
            {hasDiscount && (
              <div className="absolute top-1.5 left-1.5 badge-hot">{discount}% OFF</div>
            )}
          </Link>
          <div className="flex-1 min-w-0 py-0.5 relative">
            <Link href={`/products/${p.id}`} className="block">
              <p className="font-black text-stone-900 uppercase text-[10px] truncate">{p.brand.name}</p>
              <p className="text-stone-700 text-sm font-medium line-clamp-2 mt-0.5 leading-tight">{p.title}</p>
              {p.store?.name && (
                <p className="text-[10px] text-stone-400 font-medium mt-1 truncate">
                  by <span className="font-bold text-stone-600">{p.store.name}</span>
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-black text-stone-900 text-base">₹{displayPrice.toLocaleString('en-IN')}</span>
                {hasDiscount && (
                  <span className="text-xs text-stone-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                )}
              </div>
            </Link>
            
            <div className="absolute bottom-0 right-0 flex items-center gap-2">
              <WishlistButton productId={p.id} />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuickAdd(true);
                }}
                className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-[#FF3E6C] transition-colors press-effect shadow-md"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
        {showQuickAdd && (
          <QuickAddSheet
            product={{
              id: p.id,
              title: p.title,
              brand: p.brand.name,
              price: p.price,
              discountedPrice: p.discountedPrice,
              image: imgUrl,
              sizes: p.sizes || [],
            }}
            onClose={() => setShowQuickAdd(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`group relative ${className}`}>
        <div className={`relative rounded-2xl overflow-hidden bg-stone-100 mb-2.5 shadow-card group-hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1 ${imageContainerClassName}`}>
          <Link href={`/products/${p.id}`} className="absolute inset-0 z-0">
            <span className="sr-only">View product</span>
          </Link>
          <img
            src={imgUrl}
            alt={p.title}
            className="absolute inset-0 w-full h-full object-cover product-img pointer-events-none"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2 badge-hot pointer-events-none shadow-md">{discount}% OFF</div>
          )}
          
          {/* Dark gradient overlay for bottom actions */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton productId={p.id} />
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickAdd(true);
            }}
            className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-stone-900 flex items-center justify-center hover:bg-[#FF3E6C] hover:text-white transition-all duration-300 press-effect shadow-lg md:opacity-0 group-hover:opacity-100 md:translate-y-2 group-hover:translate-y-0"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
        
        <div className="px-0.5">
          <Link href={`/products/${p.id}`} className="block">
            <p className="font-black text-stone-900 uppercase text-[10px] truncate">{p.brand.name}</p>
            <p className="text-stone-500 text-xs font-light truncate mt-0.5 line-clamp-2 leading-tight">{p.title}</p>
            {p.store?.name && (
              <p className="text-[9px] text-stone-400 font-medium mt-0.5 truncate">
                by <span className="font-bold text-stone-500">{p.store.name}</span>
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-black text-stone-900 text-sm">₹{displayPrice.toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <span className="text-[10px] text-stone-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {showQuickAdd && (
        <QuickAddSheet
          product={{
            id: p.id,
            title: p.title,
            brand: p.brand.name,
            price: p.price,
            discountedPrice: p.discountedPrice,
            image: imgUrl,
            sizes: p.sizes || [],
          }}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </>
  );
}
