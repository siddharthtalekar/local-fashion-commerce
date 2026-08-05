'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function NewAddressPage() {
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Home',
    line1: '',
    line2: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    isDefault: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      await apiFetch('/addresses', {
        method: 'POST',
        token,
        body: JSON.stringify(formData)
      });
      router.back();
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Add New Address</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-lg mx-auto mt-2">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Save As</label>
            <div className="flex gap-2">
              {['Home', 'Work', 'Other'].map(type => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFormData(s => ({ ...s, title: type }))}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${
                    formData.title === type 
                      ? 'bg-stone-900 border-stone-900 text-white' 
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Flat, House no., Building</label>
            <input 
              type="text" required
              value={formData.line1}
              onChange={e => setFormData(s => ({ ...s, line1: e.target.value }))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
              placeholder="e.g. 123 Fashion Street, Apt 4B"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Area, Street, Sector (Optional)</label>
            <input 
              type="text" 
              value={formData.line2}
              onChange={e => setFormData(s => ({ ...s, line2: e.target.value }))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Landmark (Optional)</label>
            <input 
              type="text" 
              value={formData.landmark}
              onChange={e => setFormData(s => ({ ...s, landmark: e.target.value }))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
              placeholder="e.g. Near City Center Mall"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Pincode</label>
              <input 
                type="text" required
                value={formData.pincode}
                onChange={e => setFormData(s => ({ ...s, pincode: e.target.value }))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">City</label>
              <input 
                type="text" required
                value={formData.city}
                onChange={e => setFormData(s => ({ ...s, city: e.target.value }))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">State</label>
            <input 
              type="text" required
              value={formData.state}
              onChange={e => setFormData(s => ({ ...s, state: e.target.value }))}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition"
            />
          </div>

          <label className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              checked={formData.isDefault}
              onChange={e => setFormData(s => ({ ...s, isDefault: e.target.checked }))}
              className="w-5 h-5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span className="text-sm font-semibold text-stone-700">Make this my default address</span>
          </label>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full mt-6 bg-stone-900 text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}
