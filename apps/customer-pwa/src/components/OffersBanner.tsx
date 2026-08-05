'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, Tag, Zap, Percent } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface Offer {
  id: string;
  title: string;
  description?: string;
  discountPercent?: number;
  validUntil?: string;
  store?: { name: string };
}

// Hardcoded demo offers when API returns empty (always looks good)
const DEMO_OFFERS: Offer[] = [
  {
    id: 'demo1',
    title: '🔥 FLAT 20% OFF',
    description: 'On all ethnic wear this weekend',
    discountPercent: 20,
    validUntil: new Date(Date.now() + 86400000 * 3).toISOString(),
  },
  {
    id: 'demo2',
    title: '⚡ FIRST ORDER',
    description: 'Get 15% off on your first purchase',
    discountPercent: 15,
    validUntil: new Date(Date.now() + 86400000 * 7).toISOString(),
  },
  {
    id: 'demo3',
    title: '👟 SNEAKERS SALE',
    description: 'Up to 30% off on footwear collection',
    discountPercent: 30,
    validUntil: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    id: 'demo4',
    title: '💎 PREMIUM BRANDS',
    description: 'Extra 10% off on premium labels',
    discountPercent: 10,
    validUntil: new Date(Date.now() + 86400000 * 5).toISOString(),
  },
];

const OFFER_COLORS = [
  { bg: 'from-[#FF3E6C] to-[#FF6B35]', text: 'text-white', badge: 'bg-white/20 text-white' },
  { bg: 'from-[#0F172A] to-[#1E3A5F]', text: 'text-white', badge: 'bg-white/20 text-white' },
  { bg: 'from-[#7C3AED] to-[#DB2777]', text: 'text-white', badge: 'bg-white/20 text-white' },
  { bg: 'from-[#F59E0B] to-[#EF4444]', text: 'text-white', badge: 'bg-white/20 text-white' },
];

function getTimeLeft(validUntil?: string) {
  if (!validUntil) return null;
  const diff = new Date(validUntil).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

function OfferCard({ offer, index }: { offer: Offer; index: number }) {
  const [copied, setCopied] = useState(false);
  const colors = OFFER_COLORS[index % OFFER_COLORS.length];
  const timeLeft = getTimeLeft(offer.validUntil);
  const couponCode = `LF${offer.id.slice(0, 6).toUpperCase()}`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(couponCode);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative flex-shrink-0 w-[220px] rounded-2xl bg-gradient-to-br ${colors.bg} p-4 overflow-hidden`}
      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />

      {/* Discount badge */}
      {offer.discountPercent && (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${colors.badge} text-[10px] font-black uppercase tracking-wide mb-2`}>
          <Percent size={9} />
          {offer.discountPercent}% OFF
        </div>
      )}

      {/* Title */}
      <h4 className="text-white font-black text-sm leading-tight mb-1 relative z-10">
        {offer.title}
      </h4>

      {/* Description */}
      {offer.description && (
        <p className="text-white/70 text-[11px] font-medium mb-3 line-clamp-2 relative z-10">
          {offer.description}
        </p>
      )}

      {/* Coupon code row */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/20 border-dashed">
          <span className="text-white font-black text-xs tracking-widest">{couponCode}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition text-white press-effect"
        >
          {copied ? <Check size={13} className="stroke-[3]" /> : <Copy size={13} />}
        </button>
      </div>

      {/* Time left */}
      {timeLeft && (
        <div className="flex items-center gap-1 mt-2 relative z-10">
          <Zap size={9} className="text-white/60" />
          <span className="text-white/60 text-[9px] font-bold">{timeLeft}</span>
        </div>
      )}
    </div>
  );
}

export function OffersBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/offers/active`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOffers(data);
        } else {
          setOffers(DEMO_OFFERS);
        }
      })
      .catch(() => setOffers(DEMO_OFFERS));
  }, []);

  if (offers.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-base font-black text-stone-900 tracking-tight uppercase flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display), system-ui' }}
        >
          <Tag size={16} className="text-[#FF3E6C]" />
          Offers & Coupons
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {offers.map((offer, i) => (
          <OfferCard key={offer.id} offer={offer} index={i} />
        ))}
      </div>
    </section>
  );
}
