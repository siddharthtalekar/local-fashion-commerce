'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag, Calendar, CheckCircle2, Percent, IndianRupee } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import { toast } from '@local-fashion/utils';

export default function NewOfferPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const myStore = useStoreProfileStore((s) => s.myStore);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'percent', // or 'fixed'
    value: '',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myStore || !token) return;
    setLoading(true);

    try {
      const valueNum = parseFloat(formData.value);
      if (isNaN(valueNum) || valueNum <= 0) {
        throw new Error('Please enter a valid discount value');
      }
      if (formData.type === 'percent' && valueNum > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }

      await apiFetch(`/offers/store/${myStore.id}`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          ...formData,
          value: valueNum,
        }),
      });

      toast.success('Offer created successfully!');
      router.push('/offers');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create offer');
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-[#282C3F] font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:border-[#FF3E6C] focus:bg-white transition-all placeholder:text-stone-400";
  const labelClass = "block text-sm font-bold text-[#282C3F] mb-2";
  const sectionClass = "bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-stone-100 space-y-5 animate-slide-up";

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <Link href="/offers" className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors press-effect">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Create Offer</h1>
          <p className="text-sm text-stone-400 mt-1">Set up a new discount code for your customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={sectionClass}>
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Tag size={16} /></div>
                <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Offer Details</h2>
              </div>
              
              <div>
                <label className={labelClass}>Promo Code / Title <span className="text-[#FF3E6C]">*</span></label>
                <input type="text" required placeholder="e.g., SUMMER50, DIWALI20" className={inputClass}
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value.toUpperCase()})} />
                <p className="text-xs text-stone-400 mt-1.5">This is the code customers will see and apply.</p>
              </div>

              <div>
                <label className={labelClass}>Description <span className="text-[#FF3E6C]">*</span></label>
                <textarea rows={2} required className={`${inputClass} resize-none`} placeholder="e.g., Get 50% off on all summer collection..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <div className={sectionClass} style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Percent size={16} /></div>
                <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Discount Value</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button type="button" onClick={() => setFormData({...formData, type: 'percent'})}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all press-effect ${
                    formData.type === 'percent' 
                      ? 'border-[#FF3E6C] bg-[#FF3E6C]/5 text-[#FF3E6C]' 
                      : 'border-stone-100 text-stone-500 hover:border-stone-200'
                  }`}>
                  <Percent size={24} />
                  <span className="font-bold text-sm">Percentage %</span>
                </button>
                <button type="button" onClick={() => setFormData({...formData, type: 'fixed'})}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all press-effect ${
                    formData.type === 'fixed' 
                      ? 'border-[#FF3E6C] bg-[#FF3E6C]/5 text-[#FF3E6C]' 
                      : 'border-stone-100 text-stone-500 hover:border-stone-200'
                  }`}>
                  <IndianRupee size={24} />
                  <span className="font-bold text-sm">Fixed Amount ₹</span>
                </button>
              </div>

              <div>
                <label className={labelClass}>Discount {formData.type === 'percent' ? 'Percentage' : 'Amount'} <span className="text-[#FF3E6C]">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#282C3F] font-bold">
                    {formData.type === 'percent' ? '%' : '₹'}
                  </div>
                  <input type="number" required min="1" max={formData.type === 'percent' ? "100" : undefined} step={formData.type === 'percent' ? "1" : "0.01"} 
                    className={`${inputClass} pl-10`} placeholder="0"
                    value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
              </div>
            </div>

            <div className={sectionClass} style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={16} /></div>
                <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Validity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Valid From <span className="text-[#FF3E6C]">*</span></label>
                  <input type="date" required className={inputClass}
                    value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Valid To <span className="text-[#FF3E6C]">*</span></label>
                  <input type="date" required className={inputClass}
                    value={formData.validTo} onChange={e => setFormData({...formData, validTo: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="pt-4 pb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white transition-all press-effect disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 30px rgba(255,62,108,0.3)' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Offer...
                  </span>
                ) : (
                  <><CheckCircle2 size={20} /> Create Offer</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Pane */}
        <div className="lg:col-span-2 space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="font-bold text-[#282C3F] text-sm px-1">Live Preview</h3>
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 overflow-hidden flex flex-col sticky top-24">
            <div className={`p-6 border-b bg-[#FF3E6C]/5 border-[#FF3E6C]/10 flex justify-between items-start coupon-card relative`}>
              <div className="pr-4">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-3 bg-[#FF3E6C]/10 text-[#FF3E6C]`}>
                  Active
                </span>
                <h3 className="font-black text-xl text-[#282C3F] uppercase tracking-wider break-all">{formData.title || 'PROMOCODE'}</h3>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-black text-3xl text-[#FF3E6C]`}>
                  {formData.type === 'percent' 
                    ? `${formData.value || '0'}%` 
                    : `₹${formData.value || '0'}`}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 text-[#FF3E6C]/60`}>OFF</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-stone-500 leading-relaxed mb-6">
                {formData.description || 'Add a description to tell customers what this offer is for.'}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <Calendar size={14} />
                <span>Ends: {new Date(formData.validTo || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
