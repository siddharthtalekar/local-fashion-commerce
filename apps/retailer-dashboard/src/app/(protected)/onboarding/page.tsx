'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import { Sparkles, MapPin, Phone, MessageCircle, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Store } from 'lucide-react';

const STEPS = ['Basic Info', 'Location & Contact', 'Review'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [cityId, setCityId] = useState('');

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setMyStore = useStoreProfileStore((s) => s.setMyStore);
  const router = useRouter();

  useEffect(() => {
    apiFetch<any[]>('/cities').then((data) => {
      setCities(data);
      if (data.length > 0) setCityId(data[0].id);
    }).catch(console.error);
  }, []);

  const canGoNext = () => {
    if (step === 0) return name.trim().length > 2;
    if (step === 1) return address.trim().length > 5 && phone.trim().length >= 10 && cityId && latitude && longitude;
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<any>('/stores', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({
          name, description, address, phone, whatsapp, cityId,
          latitude: parseFloat(latitude) || 19.0760, 
          longitude: parseFloat(longitude) || 72.8777,
          categoryTags: ['Fashion', 'Apparel'],
        }),
      });
      setMyStore(res);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-[#282C3F] font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:border-[#FF3E6C] focus:bg-white transition-all placeholder:text-stone-400";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F5F6]">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
            <Store size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Welcome, {user?.name?.split(' ')[0]}</p>
            <h1 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>
              Set up your store
            </h1>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black flex-shrink-0 transition-all ${
                i < step  ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-[#FF3E6C] text-white shadow-[0_4px_12px_rgba(255,62,108,0.4)]' :
                             'bg-stone-200 text-stone-400'
              }`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-[#282C3F]' : 'text-stone-400'}`}>{s}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-emerald-400' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-stone-100 p-8">
          {error && (
            <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step 0 */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-[#282C3F] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Basic Information</h2>
                <p className="text-sm text-stone-400">Tell us about your store</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#282C3F] mb-1.5">Store Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Riya Boutique" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#282C3F] mb-1.5">Short Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Premium ethnic and western wear for women..."
                  className={`${inputClass} resize-none`} />
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-[#282C3F] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Location & Contact</h2>
                <p className="text-sm text-stone-400">How customers will reach you</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#282C3F] mb-1.5"><MapPin size={13} className="inline mr-1" />City *</label>
                <select value={cityId} onChange={(e) => setCityId(e.target.value)} className={inputClass}>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#282C3F] mb-1.5">Store Address *</label>
                <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full shop address with landmark" className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#282C3F] mb-1.5"><MapPin size={13} className="inline mr-1" />Latitude *</label>
                  <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 19.0760" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#282C3F] mb-1.5"><MapPin size={13} className="inline mr-1" />Longitude *</label>
                  <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 72.8777" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#282C3F] mb-1.5"><Phone size={13} className="inline mr-1" />Phone *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#282C3F] mb-1.5"><MessageCircle size={13} className="inline mr-1" />WhatsApp</label>
                  <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Optional" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-[#282C3F] mb-1" style={{ fontFamily: 'var(--font-display)' }}>Review & Create</h2>
                <p className="text-sm text-stone-400">Make sure everything looks right</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Store Name', value: name },
                  { label: 'Description', value: description || '—' },
                  { label: 'City', value: cities.find((c) => c.id === cityId)?.name ?? '—' },
                  { label: 'Address', value: address },
                  { label: 'Phone', value: phone },
                  { label: 'WhatsApp', value: whatsapp || '—' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3 py-2.5 border-b border-stone-100 last:border-0">
                    <span className="text-xs font-bold text-stone-400 w-24 flex-shrink-0 uppercase tracking-wide pt-0.5">{item.label}</span>
                    <span className="text-sm font-medium text-[#282C3F] flex-1">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  ⏳ Your store will be reviewed by our team. Once approved, it will appear on the customer app.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all press-effect">
                <ChevronLeft size={16} /> Back
              </button>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canGoNext()}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white transition-all press-effect disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white transition-all press-effect disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Store...
                  </span>
                ) : (
                  <><Sparkles size={16} /> Create My Store</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
