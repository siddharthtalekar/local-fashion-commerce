'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getToken } from '@/lib/api';
import { toast } from '@local-fashion/utils';
import { Package, ShoppingBag, Store as StoreIcon, ShieldOff, MapPin, User, Phone, ChevronRight } from 'lucide-react';

interface ActiveStore {
  id: string;
  name: string;
  address: string;
  city: { name: string };
  owner: { name: string; phone: string };
  _count: { products: number; orders: number };
  createdAt: string;
}

export default function AdminActiveStoresPage() {
  const token = getToken();
  const queryClient = useQueryClient();

  const { data: stores, isLoading } = useQuery({
    queryKey: ['admin-active-stores'],
    queryFn: () => apiFetch<ActiveStore[]>('/admin/stores/active', { token: token! }),
    enabled: !!token,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/admin/stores/${id}/status`, {
        method: 'PATCH', token: token!,
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-stores'] });
      toast.warning('Store has been suspended.');
    },
    onError: () => toast.error('Failed to suspend store'),
  });

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between animate-fade-in">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Active Stores</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Manage businesses currently trading on the platform.
          </p>
        </div>
        {stores && (
          <div className="text-right hidden md:block">
            <p className="text-3xl font-black text-white">{stores.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Live Stores</p>
          </div>
        )}
      </div>

      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : stores?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-2)' }}>
              <StoreIcon size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Active Stores</h3>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">Approve pending stores to see them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Owner</th>
                  <th>Metrics</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores?.map((store, i) => (
                  <tr key={store.id} className={`animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
                    <td>
                      <div>
                        <p className="font-bold text-white">{store.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <MapPin size={11} />
                          <span>{store.city.name}</span>
                        </div>
                        <span className="badge badge-success mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live Trading
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
                          style={{ background: 'var(--surface-3)' }}>
                          {store.owner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{store.owner.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{store.owner.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Package size={13} className="text-blue-400" />
                          <span className="font-bold text-white text-sm">{store._count.products}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>products</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={13} className="text-emerald-400" />
                          <span className="font-bold text-white text-sm">{store._count.orders}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>orders</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => {
                          if (confirm(`⚠️ Suspend "${store.name}"? This removes their products from the marketplace.`)) {
                            updateStatus.mutate({ id: store.id, status: 'rejected' });
                          }
                        }}
                        disabled={updateStatus.isPending}
                        className="btn btn-danger text-xs press-effect"
                      >
                        <ShieldOff size={13} />
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
