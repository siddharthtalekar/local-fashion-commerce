'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch, getToken } from '@/lib/api';
import { PackageSearch, IndianRupee } from 'lucide-react';
import { useState } from 'react';

interface GlobalOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  store: { name: string };
  user: { name: string; phone: string };
  _count: { items: number };
}

const statusBadge: Record<string, string> = {
  delivered: 'badge-success',
  cancelled: 'badge-danger',
  pending: 'badge-warning',
  confirmed: 'badge-info',
  shipped: 'badge-info',
};

const statusFilters = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const token = getToken();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiFetch<GlobalOrder[]>('/admin/orders', { token: token! }),
    enabled: !!token,
  });

  if (!token) return null;

  const filtered = statusFilter === 'all' ? orders : orders?.filter(o => o.status === statusFilter);
  const totalRevenue = filtered?.reduce((sum, o) => sum + o.totalAmount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-white tracking-tight">Global Ledger</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Platform-wide view of all transactions (last 100).
        </p>
      </div>

      {/* Summary bar */}
      {orders && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          {[
            { label: 'Total Orders', value: orders.length, color: '#3B82F6' },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#10B981' },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#F59E0B' },
            { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#EF4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="admin-card p-4">
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue banner */}
      {filtered && filtered.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border animate-slide-up"
          style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <IndianRupee size={20} className="text-emerald-400" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              {statusFilter === 'all' ? 'Total GMV' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Revenue`}
            </p>
            <p className="text-xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap animate-fade-in">
        {statusFilters.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === s
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'btn btn-ghost'
            }`}>
            {s}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-hidden animate-fade-in">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-2)' }}>
              <PackageSearch size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Orders Found</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {statusFilter !== 'all' ? statusFilter : ''} orders on the platform.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Retailer</th>
                  <th>Amount</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <p className="font-mono text-xs text-white font-bold">{order.id.slice(0, 16)}…</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td>
                      <p className="font-bold text-white text-sm">{order.user.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.user.phone}</p>
                    </td>
                    <td>
                      <p className="font-bold text-white text-sm">{order.store.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order._count.items} item(s)</p>
                    </td>
                    <td>
                      <p className="font-black text-white text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="text-right">
                      <span className={`badge ${statusBadge[order.status] ?? 'badge-info'}`}>{order.status}</span>
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
