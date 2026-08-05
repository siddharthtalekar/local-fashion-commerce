'use client';

import { useState, useEffect } from 'react';

export function FlashDealTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 23, seconds: 0 });

  useEffect(() => {
    // Generate a consistent end time for today (e.g., midnight)
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const timer = setInterval(() => {
      const diff = endOfDay.getTime() - new Date().getTime();
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <p className="text-xs text-stone-500 font-bold font-mono tracking-widest bg-stone-100 px-2 py-1 rounded-md">
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </p>
  );
}
