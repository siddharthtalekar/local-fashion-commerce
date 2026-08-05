'use client';

import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [currentUrl, setCurrentUrl] = useState(url);

  useEffect(() => {
    if (typeof window !== 'undefined' && !url.startsWith('http')) {
      setCurrentUrl(`${window.location.origin}${url}`);
    }
  }, [url]);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: currentUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: WhatsApp share and copy to clipboard
      try {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${text} ${currentUrl}`)}`;
        window.open(whatsappUrl, '_blank');
        
        await navigator.clipboard.writeText(currentUrl);
        // We'll use a generic alert/toast here
      } catch (err) {
        console.error('Failed to share: ', err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-stone-600 hover:text-myntra-pink transition"
      aria-label="Share product"
    >
      <Share2 size={18} />
    </button>
  );
}
