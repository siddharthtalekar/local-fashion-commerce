'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className = '' }: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 250);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-250 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-lg transition-transform duration-250 flex flex-col overflow-hidden max-h-[90vh] ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${className}`}
      >
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-stone-200" />
        </div>
        
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-100 flex-shrink-0">
            <h2 className="font-black text-stone-900 text-lg" style={{ fontFamily: 'var(--font-display), system-ui' }}>
              {title}
            </h2>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 min-h-0 pb-safe">
          {children}
        </div>
      </div>
    </>
  );
}
