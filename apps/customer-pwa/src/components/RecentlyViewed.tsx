'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ProductSummaryDto } from '@local-fashion/shared-types';
import { ArrowRight } from 'lucide-react';

export function RecentlyViewed() {
  const [recent, setRecent] = useState<ProductSummaryDto[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lf_recently_viewed');
      if (stored) {
        setRecent(JSON.parse(stored).slice(0, 6));
      }
    } catch {}
  }, []);

  if (recent.length === 0) return null;

  return (
    <section className="animate-fade-in mt-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-lg font-black text-stone-900 tracking-tight" style={{ fontFamily: 'var(--font-display), system-ui' }}>
          Continue Browsing
        </h2>
        <Link href="/search" className="text-xs font-bold text-stone-500 hover:text-myntra-pink transition flex items-center gap-1">
          View All <ArrowRight size={12} />
        </Link>
      </div>
      
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x">
        {recent.map((product) => (
          <Link 
            key={product.id} 
            href={`/products/${product.id}`}
            className="block w-28 flex-shrink-0 snap-start group"
          >
            <div className="w-full aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow relative">
              {product.images?.[0]?.url && (
                <img 
                  src={product.images[0].url} 
                  alt={product.title} 
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
            <p className="mt-2 text-[10px] font-black uppercase text-stone-900 truncate">{product.brand?.name}</p>
            <p className="text-[10px] text-stone-500 font-medium truncate mt-0.5">{product.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
