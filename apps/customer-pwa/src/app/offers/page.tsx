'use client';

import { useEffect, useState } from 'react';
import { Tag, ChevronLeft, Percent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { OfferDto, OfferType } from '@local-fashion/shared-types';

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<OfferDto[]>('/offers/active')
      .then(data => {
        setOffers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch active offers:', err);
        setLoading(false);
      });
  }, []);
  
  const getOfferIcon = (type: OfferType) => {
    if (type === OfferType.PERCENT) return <Percent size={28} />;
    return <Tag size={28} />;
  };

  const getDiscountText = (offer: OfferDto) => {
    if (offer.type === OfferType.PERCENT) return `${offer.value}% OFF`;
    if (offer.type === OfferType.FLAT) return `₹${offer.value} OFF`;
    if (offer.type === OfferType.BOGO) return `BOGO`;
    return 'DEAL';
  };
  
  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Coupons & Offers</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto mt-4">
        {loading ? (
          <div className="text-center text-stone-500 p-8">Loading deals...</div>
        ) : offers.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
            <Tag size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 font-medium">No active deals right now.</p>
            <p className="text-sm text-stone-400 mt-2">Check back later for flash sales!</p>
          </div>
        ) : (
          offers.map(offer => {
            const storeName = offer.store?.name || 'Local Store';
            return (
              <div key={offer.id} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm flex gap-4 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${offer.type === OfferType.PERCENT ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${offer.type === OfferType.PERCENT ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                  {getOfferIcon(offer.type)}
                </div>
                
                <div className="flex-1">
                  <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider mb-1 ${offer.type === OfferType.PERCENT ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                    {getDiscountText(offer)}
                  </div>
                  <h3 className="font-bold text-stone-900">{offer.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{offer.description}</p>
                  
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider">From</p>
                      <p className="text-xs font-bold text-stone-700">{storeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider">Valid Till</p>
                      <p className="text-xs font-bold text-stone-700">{new Date(offer.validTo).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
