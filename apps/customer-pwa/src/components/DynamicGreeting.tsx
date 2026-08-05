'use client';

import { useState, useEffect } from 'react';

export function DynamicGreeting({ citySlug }: { citySlug: string }) {
  const [greeting, setGreeting] = useState('Good evening');
  const [emoji, setEmoji] = useState('👋');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
      setEmoji('🌅');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
      setEmoji('☀️');
    } else {
      setGreeting('Good evening');
      setEmoji('🌙');
    }
  }, []);

  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-[#FF3E6C]/10 to-[#FF905A]/10 p-4 rounded-3xl border border-rose-100/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lg shadow-sm border border-rose-100 shrink-0 relative z-10 animate-bounce-in">
        {emoji}
      </div>
      <div className="relative z-10">
        <h1 className="text-xl font-black text-stone-900 leading-tight" style={{ fontFamily: 'var(--font-display), system-ui' }}>
          {greeting}!
        </h1>
        <p className="text-xs text-stone-600 font-medium mt-0.5">
          Ready to discover what's trending in {citySlug}?
        </p>
      </div>
    </div>
  );
}
