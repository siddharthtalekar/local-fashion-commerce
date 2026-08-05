'use client';

import Link from 'next/link';
import { useCompareStore } from '@/store/compare';

export function CompareBar() {
  const productIds = useCompareStore((s) => s.productIds);

  if (productIds.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="flex items-center justify-between rounded-2xl bg-neutral-900 px-4 py-3 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
            {productIds.length}
          </div>
          <span className="font-medium">Items selected</span>
        </div>
        <Link
          href="/compare"
          className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-neutral-900 active:scale-95 transition-transform"
        >
          Compare now
        </Link>
      </div>
    </div>
  );
}
