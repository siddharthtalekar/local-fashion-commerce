'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import { Store, MapPin, Phone, MessageCircle, Save, CheckCircle2, User, Key, Link as LinkIcon, Camera } from 'lucide-react';
import { toast } from '@local-fashion/utils';

export default function SettingsPage() {
  const token = useAuthStore((s) => s.token);
  const myStore = useStoreProfileStore((s) => s.myStore);
  const setMyStore = useStoreProfileStore((s) => s.setMyStore);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'account' | 'password'>('profile');
  const user = useAuthStore((s) => s.user);
  
  const [formData, setFormData] = useState({
    name: myStore?.name || '',
    description: myStore?.description || '',
    address: myStore?.address || '',
    phone: myStore?.phone || '',
    whatsapp: myStore?.whatsapp || '',
    openingHours: (myStore as any)?.openingHours || {
      monday: '10:00 AM - 09:00 PM',
      tuesday: '10:00 AM - 09:00 PM',
      wednesday: '10:00 AM - 09:00 PM',
      thursday: '10:00 AM - 09:00 PM',
      friday: '10:00 AM - 09:00 PM',
      saturday: '10:00 AM - 09:00 PM',
      sunday: 'Closed',
    },
    accountName: user?.name || '',
    accountPhone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleOpeningHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      if (activeTab === 'profile' || activeTab === 'hours') {
        if (!myStore) return;
        const res = await apiFetch<any>(`/stores/${myStore.id}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(formData),
        });
        setMyStore(res);
        toast.success('Store settings updated successfully');
      } else if (activeTab === 'account') {
        const res = await apiFetch<any>(`/profile`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ name: formData.accountName, phone: formData.accountPhone }),
        });
        // We could update the user store here if there was a setUser method, but we can just reload for now
        // or add a setUser method to the store. 
        useAuthStore.setState({ user: { ...user!, name: res.name, phone: res.phone } });
        toast.success('Account settings updated successfully');
      } else if (activeTab === 'password') {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await apiFetch<any>(`/profile/password`, {
          method: 'PATCH',
          token,
          body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword }),
        });
        toast.success('Password changed successfully');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!myStore) return <div className="p-8 text-stone-500">Loading settings...</div>;

  const inputClass = "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-[#282C3F] font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:border-[#FF3E6C] focus:bg-white transition-all placeholder:text-stone-400";
  const labelClass = "block text-sm font-bold text-[#282C3F] mb-2";
  const sectionClass = "bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 space-y-6 animate-slide-up";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
        <div>
          <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Store Settings</h1>
          <p className="text-stone-400 text-sm mt-1">Manage your store profile and business details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Navigation/Quick info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-slide-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-stone-100 border-4 border-white shadow-sm flex items-center justify-center mb-4 relative overflow-hidden group">
                <div className="text-3xl font-black text-stone-400">
                  {myStore.name.charAt(0)}
                </div>
                <button className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} />
                </button>
              </div>
              <h2 className="text-lg font-black text-[#282C3F] mb-1" style={{ fontFamily: 'var(--font-display)' }}>{myStore.name}</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                myStore.verificationStatus === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {myStore.verificationStatus === 'approved' ? <CheckCircle2 size={12} /> : null}
                {myStore.verificationStatus === 'approved' ? 'Verified Store' : 'Pending Review'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-slide-up space-y-1">
            <button type="button" onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-colors ${activeTab === 'profile' ? 'bg-[#FF3E6C]/5 text-[#FF3E6C]' : 'hover:bg-stone-50 text-stone-600'}`}>
              <Store size={18} /> Store Profile
            </button>
            <button type="button" onClick={() => setActiveTab('hours')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-colors ${activeTab === 'hours' ? 'bg-[#FF3E6C]/5 text-[#FF3E6C]' : 'hover:bg-stone-50 text-stone-600'}`}>
              <User size={18} /> Opening Hours
            </button>
            <button type="button" onClick={() => setActiveTab('account')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-colors ${activeTab === 'account' ? 'bg-[#FF3E6C]/5 text-[#FF3E6C]' : 'hover:bg-stone-50 text-stone-600'}`}>
              <User size={18} /> Account Settings
            </button>
            <button type="button" onClick={() => setActiveTab('password')} className={`w-full flex items-center gap-3 p-3 rounded-2xl font-bold text-sm transition-colors ${activeTab === 'password' ? 'bg-[#FF3E6C]/5 text-[#FF3E6C]' : 'hover:bg-stone-50 text-stone-600'}`}>
              <Key size={18} /> Password & Security
            </button>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className={sectionClass}>
            {activeTab === 'profile' ? (
              <>
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Store size={16} /></div>
                  <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Basic Information</h2>
                </div>

                <div>
                  <label className={labelClass}>Store Name <span className="text-[#FF3E6C]">*</span></label>
                  <input type="text" required className={inputClass}
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                <div>
                  <label className={labelClass}>Store Description</label>
                  <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Tell customers about your store..."
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="flex items-center gap-3 border-b border-stone-100 pb-4 pt-4 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><MapPin size={16} /></div>
                  <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Location & Contact</h2>
                </div>

                <div>
                  <label className={labelClass}>Complete Address <span className="text-[#FF3E6C]">*</span></label>
                  <textarea rows={2} required className={`${inputClass} resize-none`} placeholder="Shop No, Building, Street, Area..."
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone Number <span className="text-[#FF3E6C]">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <Phone size={16} />
                      </div>
                      <input type="tel" required className={`${inputClass} pl-11`}
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>WhatsApp Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <MessageCircle size={16} />
                      </div>
                      <input type="tel" className={`${inputClass} pl-11`} placeholder="Optional"
                        value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                    </div>
                  </div>
                </div>
              </>
            ) : activeTab === 'hours' ? (
              <>
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Store size={16} /></div>
                  <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Opening Hours</h2>
                </div>
                <div className="space-y-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                      <span className="w-24 text-sm font-bold text-stone-600 capitalize">{day}</span>
                      <input type="text" className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-[#FF3E6C]"
                        placeholder="e.g. 10:00 AM - 09:00 PM or Closed"
                        value={formData.openingHours[day as keyof typeof formData.openingHours] || ''}
                        onChange={(e) => handleOpeningHoursChange(day, e.target.value)} />
                    </div>
                  ))}
                </div>
              </>
            ) : activeTab === 'account' ? (
              <>
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><User size={16} /></div>
                  <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Account Settings</h2>
                </div>
                <div>
                  <label className={labelClass}>Full Name <span className="text-[#FF3E6C]">*</span></label>
                  <input type="text" required className={inputClass}
                    value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number <span className="text-[#FF3E6C]">*</span></label>
                  <input type="tel" required className={inputClass}
                    value={formData.accountPhone} onChange={e => setFormData({...formData, accountPhone: e.target.value})} />
                </div>
              </>
            ) : activeTab === 'password' ? (
              <>
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><Key size={16} /></div>
                  <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Password & Security</h2>
                </div>
                <div>
                  <label className={labelClass}>Current Password <span className="text-[#FF3E6C]">*</span></label>
                  <input type="password" required className={inputClass}
                    value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>New Password <span className="text-[#FF3E6C]">*</span></label>
                  <input type="password" required className={inputClass}
                    value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password <span className="text-[#FF3E6C]">*</span></label>
                  <input type="password" required className={inputClass}
                    value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              </>
            ) : null}

            <div className="pt-6 border-t border-stone-100">
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white transition-all press-effect disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving Changes...
                  </span>
                ) : (
                  <><Save size={18} /> Save Settings</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
