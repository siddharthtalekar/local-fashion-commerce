'use client';

import { CheckCircle2, ChevronRight, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-stone-50 p-4 pt-16 text-center">
      
      {/* Success Icon Animation */}
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75"></div>
        <div className="relative rounded-full bg-emerald-50 p-4">
          <CheckCircle2 size={64} className="text-emerald-500" strokeWidth={2} />
        </div>
      </div>
      
      <h1 className="mb-2 text-2xl font-bold text-stone-900">Order Placed Successfully!</h1>
      <p className="mb-8 text-sm text-stone-500 max-w-[280px]">
        Thank you for shopping with us. Your order <span className="font-bold text-stone-700">#ORD-9876543</span> has been placed.
      </p>

      {/* Quick Actions */}
      <div className="w-full max-w-sm space-y-3">
        <Link 
          href="/orders" 
          className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:bg-stone-50 active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-2 text-blue-600">
              <Package size={20} />
            </div>
            <span className="font-bold text-stone-900">Track Order</span>
          </div>
          <ChevronRight size={20} className="text-stone-400" />
        </Link>
        
        <Link 
          href="/" 
          className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:bg-stone-50 active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-rose-50 p-2 text-myntra-pink">
              <ShoppingBag size={20} />
            </div>
            <span className="font-bold text-stone-900">Continue Shopping</span>
          </div>
          <ChevronRight size={20} className="text-stone-400" />
        </Link>
      </div>
      
    </div>
  );
}
