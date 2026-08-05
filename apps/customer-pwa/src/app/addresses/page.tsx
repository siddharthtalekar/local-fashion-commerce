'use client';

import { useEffect, useState } from 'react';
import { MapPin, ChevronLeft, Plus, Trash2, Home, Briefcase, Map, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { toast } from '@/components/Toast';

interface Address {
  id: string;
  title: string;
  line1: string;
  line2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchAddresses = () => {
    if (!token) return;
    setLoading(true);
    apiFetch<Address[]>('/addresses', { token })
      .then(data => {
        setAddresses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch addresses:', err);
        toast('Failed to load addresses', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleDeleteConfirm = async (id: string) => {
    setDeletingId(id);
    try {
      await apiFetch(`/addresses/${id}`, { method: 'DELETE', token });
      toast('Address deleted', 'info');
      fetchAddresses();
    } catch {
      toast('Failed to delete address', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Saved Addresses</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto mt-2">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-stone-100 h-28 skeleton" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center flex flex-col items-center mt-10">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4">
              <MapPin size={32} />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">No Saved Addresses</h2>
            <p className="text-sm text-stone-500 mb-6">Add your delivery locations to checkout faster.</p>
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 flex-shrink-0">
                    {address.title.toLowerCase() === 'home' ? <Home size={16} /> :
                     address.title.toLowerCase() === 'work' ? <Briefcase size={16} /> : <Map size={16} />}
                  </div>
                  <span className="font-bold text-stone-900">{address.title}</span>
                  {address.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-green-100 text-green-700">
                      DEFAULT
                    </span>
                  )}
                </div>

                {/* Delete */}
                {confirmDeleteId === address.id ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs font-bold text-stone-500 px-2 py-1 rounded-lg hover:bg-stone-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(address.id)}
                      disabled={deletingId === address.id}
                      className="text-xs font-bold text-white bg-rose-500 px-3 py-1 rounded-lg hover:bg-rose-600 transition flex items-center gap-1 disabled:opacity-60"
                    >
                      {deletingId === address.id ? <Loader2 size={12} className="animate-spin" /> : null}
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(address.id)}
                    className="p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <p className="text-sm text-stone-600 leading-relaxed ml-10">
                {address.line1}<br />
                {address.line2 && <>{address.line2}<br /></>}
                {address.landmark && <>Landmark: {address.landmark}<br /></>}
                {address.city}, {address.state} {address.pincode}
              </p>
            </div>
          ))
        )}

        {/* Add Button */}
        <button
          onClick={() => router.push('/addresses/new')}
          className="w-full mt-6 bg-stone-900 text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition hover:bg-stone-800"
        >
          <Plus size={20} />
          Add New Address
        </button>
      </div>
    </div>
  );
}
