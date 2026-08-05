'use client';

import { useState } from 'react';
import { UserCircle, ChevronLeft, MapPin, Phone, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/Toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, setAuth, refreshToken } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!token || !name.trim()) return;

    setIsSaving(true);
    try {
      const updated = await apiFetch<{ id: string; name: string; phone: string; role: string; cityId: string | null }>(
        '/profile',
        {
          method: 'PATCH',
          token,
          body: JSON.stringify({ name: name.trim() }),
        }
      );
      // Update auth store with new name while preserving other fields
      if (user) {
        setAuth(token, refreshToken ?? '', { ...user, name: updated.name });
      }
      toast('Profile updated successfully!', 'success');
    } catch (err: any) {
      toast(err?.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Account Settings</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto mt-2">
        
        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-6">
          
          {/* Profile Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-400 to-pink-600 flex items-center justify-center text-white font-black text-4xl mb-3 border-2 border-rose-100">
                {user?.name?.charAt(0)?.toUpperCase() ?? <UserCircle size={64} strokeWidth={1} />}
              </div>
            </div>
            <p className="text-xs text-stone-500">{user?.name}</p>
          </div>

          <hr className="border-stone-100" />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">Full Name</label>
              <div className="mt-1 flex items-center bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100 focus-within:border-stone-300 focus-within:bg-white transition-colors">
                <UserCircle size={18} className="text-stone-400 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-transparent border-none outline-none w-full text-sm font-medium text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">Phone Number</label>
              <div className="mt-1 flex items-center bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100">
                <Phone size={18} className="text-stone-400 mr-3 flex-shrink-0" />
                <input
                  type="tel"
                  value={user?.phone ?? ''}
                  disabled
                  className="bg-transparent border-none outline-none w-full text-sm font-medium text-stone-500"
                />
                <span className="text-[10px] font-bold text-stone-400 bg-stone-200 px-2 py-0.5 rounded flex-shrink-0">VERIFIED</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1 ml-1">Phone number cannot be changed</p>
            </div>

          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || name.trim() === user?.name}
            className="w-full mt-8 bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}
