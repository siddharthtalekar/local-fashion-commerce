'use client';

import { useEffect } from 'react';
import type { ProductSummaryDto } from '@local-fashion/shared-types';

export function TrackRecentView({ product }: { product: ProductSummaryDto }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lf_recently_viewed');
      let recent: ProductSummaryDto[] = stored ? JSON.parse(stored) : [];
      
      // Remove if already exists to move to top
      recent = recent.filter(p => p.id !== product.id);
      
      // Add to beginning
      recent.unshift(product);
      
      // Keep only top 10
      if (recent.length > 10) {
        recent = recent.slice(0, 10);
      }
      
      localStorage.setItem('lf_recently_viewed', JSON.stringify(recent));
    } catch (e) {
      console.error('Failed to track recent view', e);
    }
  }, [product.id]); // only re-run if ID changes

  return null;
}
