'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch, getToken } from '@/lib/api';
import { Users as UsersIcon, Search } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'retailer' | 'admin';
  createdAt: string;
}

const roleBadge = {
  admin: 'badge-purple',
  retailer: 'badge-warning',
  customer: 'badge-info',
};

const roleFilter = ['all', 'customer', 'retailer', 'admin'] as const;

export default function AdminUsersPage() {
  const token = getToken();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<typeof roleFilter[number]>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch<User[]>('/admin/users', { token: token! }),
    enabled: !!token,
  });

  if (!token) return null;

  const filtered = users?.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    const matchRole = role === 'all' || u.role === role;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Platform Users</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Directory of all registered customers, retailers, and admins.
          </p>
        </div>
        {users && (
          <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
            {filtered?.length ?? 0} of {users.length} users
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-slide-up">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {roleFilter.map((r) => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                role === r
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'btn btn-ghost'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-hidden animate-fade-in">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((user, i) => (
                  <tr key={user.id} className={`animate-fade-in`} style={{ animationDelay: `${i * 20}ms` }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                          style={{ background: `hsl(${user.name.charCodeAt(0) * 7 % 360}, 60%, 40%)` }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{user.name}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{user.id.slice(0, 12)}…</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-white">{user.phone}</p>
                    </td>
                    <td>
                      <span className={`badge ${roleBadge[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="text-right">
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                  </tr>
                ))}
                {filtered?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-2)' }}>
                        <UsersIcon size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <p className="font-bold text-white text-sm">No users found</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Adjust your search or filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
