'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let globalShowToast: ((message: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  globalShowToast?.(message, type);
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    globalShowToast = showToast;
    return () => { globalShowToast = null; };
  }, [showToast]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />,
    error: <XCircle size={18} className="text-rose-500 flex-shrink-0" />,
    info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-l-emerald-500',
    error: 'border-l-rose-500',
    info: 'border-l-blue-500',
  };

  return (
    <div className="fixed top-4 left-1/2 z-[200] flex flex-col gap-2 pointer-events-none" style={{ transform: 'translateX(-50%)', width: 'calc(100vw - 32px)', maxWidth: 400 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-toast flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-modal border border-stone-100 border-l-4 ${borders[t.type]} pointer-events-auto`}
        >
          {icons[t.type]}
          <p className="text-sm font-semibold text-stone-800 flex-1">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-stone-400 hover:text-stone-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
