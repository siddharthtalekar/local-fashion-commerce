'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowFallback(true);
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-4 shadow-md text-white mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-wide">Install LocalFashion App</h3>
          <p className="text-xs text-rose-100 mt-1 max-w-[200px]">Get a faster, native app-like experience directly on your home screen.</p>
        </div>
        <button 
          onClick={handleInstallClick}
          className="bg-white text-rose-600 font-bold px-4 py-2 rounded-full text-xs shadow-sm hover:shadow-md active:scale-95 transition"
        >
          <span className="flex items-center gap-1"><Download size={14} /> Install</span>
        </button>
      </div>

      {showFallback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowFallback(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto mb-4">
              <Download size={32} />
            </div>
            <h3 className="font-bold text-lg text-stone-900 mb-2">Manual Installation</h3>
            <p className="text-stone-500 text-sm mb-6">
              To install this app on your phone:
              <br /><br />
              <strong>iOS (Safari):</strong> Tap the Share button at the bottom, then scroll down and tap "Add to Home Screen".
              <br /><br />
              <strong>Android (Chrome):</strong> Tap the 3-dot menu at the top right, then tap "Add to Home screen".
            </p>
            <button 
              onClick={() => setShowFallback(false)}
              className="w-full bg-stone-900 text-white font-bold py-3 rounded-full shadow-md active:scale-95 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
