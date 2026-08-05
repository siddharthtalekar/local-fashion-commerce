'use client';

import { Button } from '@local-fashion/ui';
import { useCompareStore } from '@/store/compare';
import { GitCompare } from 'lucide-react';

export function CompareButton({ productId }: { productId: string }) {
  const toggle = useCompareStore((s) => s.toggle);
  const isInCompare = useCompareStore((s) => s.isInCompare(productId));

  return (
    <button 
      onClick={() => toggle(productId)}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded border transition ${
        isInCompare 
          ? 'border-myntra-pink bg-rose-50 text-myntra-pink' 
          : 'border-stone-200 bg-white text-stone-600 hover:border-myntra-pink hover:text-myntra-pink'
      }`}
      title={isInCompare ? 'Remove from compare' : 'Add to compare'}
    >
      <GitCompare size={20} />
    </button>
  );
}
