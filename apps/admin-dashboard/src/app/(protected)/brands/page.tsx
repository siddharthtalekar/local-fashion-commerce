'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch, getToken } from '@/lib/api';
import { toast } from '@local-fashion/utils';
import { Copyright, Plus, Trash2, CheckCircle2, Hash } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function AdminBrandsPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const [newBrandName, setNewBrandName] = useState('');

  const { data: brands, isLoading } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: () => apiFetch<Brand[]>('/brands', { token: token! }),
    enabled: !!token,
  });

  const createBrand = useMutation({
    mutationFn: () =>
      apiFetch('/admin/brands', {
        method: 'POST', token: token!,
        body: JSON.stringify({ name: newBrandName }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      setNewBrandName('');
      toast.success('Brand created successfully!');
    },
    onError: () => toast.error('Failed to create brand'),
  });

  const deleteBrand = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/brands/${id}`, { method: 'DELETE', token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      toast.warning('Brand deleted.');
    },
    onError: () => toast.error('Cannot delete brand — it may have products linked.'),
  });

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-white tracking-tight">Taxonomy: Brands</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage product brands available to all retailers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="admin-card p-5 h-fit animate-slide-up">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-rose-400" /> Add New Brand
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. Nike, H&M, Zara"
              value={newBrandName}
              onChange={e => setNewBrandName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newBrandName.trim()) createBrand.mutate(); }}
            />
            <button
              onClick={() => { if (newBrandName.trim()) createBrand.mutate(); }}
              disabled={!newBrandName.trim() || createBrand.isPending}
              className="btn btn-primary w-full justify-center text-sm press-effect"
            >
              {createBrand.isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
              ) : (
                <><Plus size={14} /> Create Brand</>
              )}
            </button>
          </div>
        </div>

        {/* Brand list */}
        <div className="lg:col-span-2 admin-card overflow-hidden animate-slide-up stagger-2">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Slug</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {brands?.map((brand, i) => (
                  <tr key={brand.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                          <Copyright size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p className="font-bold text-white">{brand.name}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Hash size={11} style={{ color: 'var(--text-muted)' }} />
                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{brand.slug}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => { if (confirm(`Delete brand "${brand.name}"? This may fail if products use it.`)) deleteBrand.mutate(brand.id); }}
                        disabled={deleteBrand.isPending}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {brands?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                      No brands yet. Add one on the left.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
