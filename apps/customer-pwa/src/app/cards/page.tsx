'use client';

import { CreditCard, ChevronLeft, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CardsPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Payment Methods</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto mt-4">
        
        <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
            <CreditCard size={32} />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">No Saved Methods</h3>
          <p className="text-sm text-stone-500 mb-6">Save a card or UPI ID for faster checkout.</p>
          
          <button className="flex items-center justify-center gap-2 w-full bg-stone-900 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md active:scale-95 transition">
            <Plus size={20} />
            Add New Card
          </button>
        </div>

      </div>
    </div>
  );
}
