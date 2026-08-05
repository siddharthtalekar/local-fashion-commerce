'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { toastManager, ToastItem } from '@local-fashion/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />,
  error: <XCircle size={18} className="text-rose-400 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-400 flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />,
};

const BARS: Record<ToastType, string> = {
  success: 'bg-emerald-400',
  error: 'bg-rose-400',
  info: 'bg-blue-400',
  warning: 'bg-amber-400',
};

export function Toast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((next: ToastItem[]) => setItems(next));
    return unsubscribe;
  }, []);

  if (!items.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-[340px] w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className="animate-toast relative flex items-start gap-3 bg-[#1A1D2E] text-white rounded-2xl shadow-lg px-4 py-3 pr-10 overflow-hidden border border-white/10"
        >
          {ICONS[item.type]}
          <p className="text-sm font-medium leading-snug flex-1">{item.message}</p>
          <button
            onClick={() => toastManager.remove(item.id)}
            className="absolute top-2.5 right-2.5 text-white/40 hover:text-white/80 transition-colors"
          >
            <X size={14} />
          </button>
          {/* Progress bar */}
          <div
            className={`absolute bottom-0 left-0 h-0.5 ${BARS[item.type]} animate-[progressBar_4s_linear_forwards]`}
            style={{ animation: `progressBar 4s linear forwards` }}
          />
        </div>
      ))}
    </div>
  );
}
