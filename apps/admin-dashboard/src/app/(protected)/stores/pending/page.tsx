'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getToken } from '@/lib/api';
import { toast } from '@local-fashion/utils';
import { Clock, MapPin, Phone, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PendingStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  owner: { name: string; phone: string };
  city: { name: string };
  createdAt: string;
}

export default function AdminPendingStoresPage() {
  const token = getToken();
  const queryClient = useQueryClient();

  const { data: stores, isLoading } = useQuery({
    queryKey: ['pending-stores'],
    queryFn: () => apiFetch<PendingStore[]>('/admin/stores/pending', { token: token! }),
    enabled: !!token,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/admin/stores/${id}/status`, {
        method: 'PATCH',
        token: token!,
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['pending-stores'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      if (vars.status === 'approved') {
        toast.success('Store approved successfully!');
      } else {
        toast.warning('Store has been rejected.');
      }
    },
    onError: () => toast.error('Failed to update store status'),
  });

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-white tracking-tight">Store Approvals</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Review and approve new retailers applying to join the platform.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : stores?.length === 0 ? (
        <div className="admin-card p-16 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--success-bg)' }}>
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">All Caught Up!</h3>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">No stores are waiting for your review right now.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {stores?.map((store, i) => (
            <div key={store.id} className={`admin-card p-5 animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-black text-white text-lg">{store.name}</h3>
                    <span className="badge badge-warning">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Pending Review
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={13} />
                      <span className="truncate">{store.city.name} — {store.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <User size={13} />
                      <span>{store.owner.name}</span>
                      <Phone size={13} className="ml-2" />
                      <span>{store.owner.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={13} />
                      <span>Applied {new Date(store.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { if (confirm(`Reject application for "${store.name}"?`)) updateStatus.mutate({ id: store.id, status: 'rejected' }); }}
                    disabled={updateStatus.isPending}
                    className="btn btn-danger text-xs press-effect"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                  <button
                    onClick={() => { if (confirm(`Approve "${store.name}" to start selling?`)) updateStatus.mutate({ id: store.id, status: 'approved' }); }}
                    disabled={updateStatus.isPending}
                    className="btn btn-success text-xs press-effect"
                  >
                    <CheckCircle size={14} />
                    Approve Store
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
