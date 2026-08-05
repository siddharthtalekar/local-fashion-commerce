'use client';

import { useState } from 'react';
import { ScratchCard } from '@/components/ScratchCard';
import { ChevronLeft, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RewardsPage() {
  const router = useRouter();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const couponCode = "LCLFASHION50";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Rewards</h1>
      </div>

      <div className="p-6 max-w-md mx-auto flex flex-col items-center">
        
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
          <Sparkles size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-stone-900 mb-2">Scratch & Win!</h2>
        <p className="text-stone-500 text-center text-sm mb-10">
          You have earned a surprise reward for your recent purchase. Scratch the card below to reveal it!
        </p>

        <div className="bg-white p-4 rounded-3xl shadow-lg border border-stone-100 w-full mb-8">
          <div className="rounded-2xl overflow-hidden flex justify-center bg-stone-50 relative">
            <ScratchCard 
              width={280} 
              height={140} 
              color="#e2e8f0" 
              brushSize={25}
              finishPercent={40}
              onComplete={() => setIsRevealed(true)}
            >
              {/* This is the hidden content */}
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-dashed border-rose-300 rounded-2xl">
                <p className="text-rose-600 font-bold text-sm uppercase tracking-widest mb-1">You Won!</p>
                <p className="text-3xl font-black text-stone-900 mb-1">50% OFF</p>
                <p className="text-xs text-stone-500">Up to ₹500 discount</p>
              </div>
            </ScratchCard>
          </div>
        </div>

        {/* Action Button that appears after revealing */}
        <div className={`w-full transition-all duration-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-0.5">Coupon Code</p>
              <p className="text-lg font-black text-stone-800 tracking-widest">{couponCode}</p>
            </div>
            <button 
              onClick={handleCopy}
              className={`p-3 rounded-full transition ${isCopied ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {isCopied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
            </button>
          </div>
          
          <button onClick={() => router.push('/')} className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl shadow-md active:scale-95 transition">
            Shop Now & Apply Code
          </button>
        </div>

      </div>
    </div>
  );
}
