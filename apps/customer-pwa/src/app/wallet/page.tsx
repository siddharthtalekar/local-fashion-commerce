'use client';

import { Wallet, ChevronLeft, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WalletPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">My Wallet</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto mt-2">
        
        {/* Balance Card */}
        <div className="bg-stone-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-stone-900/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 flex items-center gap-3 mb-2 opacity-80">
            <Wallet size={20} />
            <span className="text-sm font-medium tracking-wide">Available Balance</span>
          </div>
          <div className="relative z-10 flex items-end gap-2">
            <span className="text-4xl font-bold tracking-tight">₹0</span>
            <span className="text-stone-400 font-medium mb-1.5">.00</span>
          </div>
          <div className="relative z-10 mt-6 flex gap-3">
            <button className="flex-1 bg-white text-stone-900 py-3 rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition">
              Add Money
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-lg font-bold text-stone-900 mb-4 px-1 flex items-center gap-2">
            <Clock size={18} className="text-stone-500" />
            Recent Activity
          </h2>
          
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
              <Clock size={28} />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-1">No Transactions</h3>
            <p className="text-sm text-stone-500">You have no wallet activity yet.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
