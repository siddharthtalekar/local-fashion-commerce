'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import { Tag, Trash2, CalendarDays, Plus, TicketPercent } from 'lucide-react';
import { toast } from '@local-fashion/utils';

interface Offer {
  id: string; title: string; description: string; type: string; value: number;
  validFrom: string; validTo: string; createdAt: string;
}

export default function OffersPage() {
  const token = useAuthStore((s) => s.token);
  const myStore = useStoreProfileStore((s) => s.myStore);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!myStore || !token) return;
    apiFetch<Offer[]>(`/offers/store/${myStore.id}`, { token })
      .then(setOffers)
      .catch((e) => toast.error('Failed to load offers'))
      .finally(() => setLoading(false));
  }, [myStore, token]);

  const handleDelete = async (id: string) => {
    if (!token || !myStore) return;
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    try {
      setOffers(offers.filter(o => o.id !== id));
      await apiFetch(`/offers/store/${myStore.id}/${id}`, { method: 'DELETE', token });
      toast.success('Offer deleted successfully');
    } catch (e) {
      toast.error('Failed to delete offer');
      // refresh if failed
      apiFetch<Offer[]>(`/offers/store/${myStore.id}`, { token }).then(setOffers);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
        <div>
          <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Offers & Promos</h1>
          <p className="text-stone-400 text-sm mt-1">Create discount codes to attract more customers.</p>
        </div>
        <Link href="/offers/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white transition-all press-effect"
          style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}>
          <Plus size={18} /> Create Offer
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-3xl" />)}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] animate-slide-up flex flex-col items-center">
          <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center mb-6">
            <TicketPercent size={32} className="text-stone-400" />
          </div>
          <h3 className="text-xl font-black text-[#282C3F] mb-2" style={{ fontFamily: 'var(--font-display)' }}>No Active Offers</h3>
          <p className="text-stone-400 text-sm max-w-sm mb-8">
            Discount codes are a great way to boost sales and attract new customers to your store.
          </p>
          <Link href="/offers/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all press-effect"
            style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
            <Plus size={18} /> Create Your First Offer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers.map((offer, i) => {
            const isActive = new Date(offer.validTo) > new Date();
            
            return (
              <div key={offer.id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 overflow-hidden flex flex-col animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Coupon Header */}
                <div className={`p-6 border-b ${isActive ? 'bg-[#FF3E6C]/5 border-[#FF3E6C]/10' : 'bg-stone-50 border-stone-100'} flex justify-between items-start coupon-card relative`}>
                  <div className="pr-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-3 ${
                      isActive ? 'bg-[#FF3E6C]/10 text-[#FF3E6C]' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                    <h3 className="font-black text-xl text-[#282C3F] uppercase tracking-wider break-all">{offer.title}</h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-3xl ${isActive ? 'text-[#FF3E6C]' : 'text-stone-400'}`}>
                      {offer.type === 'percent' ? `${offer.value}%` : `₹${offer.value}`}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'text-[#FF3E6C]/60' : 'text-stone-400'}`}>OFF</p>
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-500 leading-relaxed mb-6">{offer.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      <CalendarDays size={14} />
                      <span>Ends: {new Date(offer.validTo).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <button onClick={() => handleDelete(offer.id)} 
                      className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
