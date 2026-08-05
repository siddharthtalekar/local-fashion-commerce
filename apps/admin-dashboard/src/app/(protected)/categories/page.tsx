'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch, getToken } from '@/lib/api';
import { toast } from '@local-fashion/utils';
import { Tag, Plus, Trash2, Hash, ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
}

export default function AdminCategoriesPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => apiFetch<Category[]>('/categories', { token: token! }),
    enabled: !!token,
  });

  const createCategory = useMutation({
    mutationFn: () =>
      apiFetch('/admin/categories', {
        method: 'POST', token: token!,
        body: JSON.stringify({ name: newCatName, imageUrl: newCatImage || undefined }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCatName('');
      setNewCatImage('');
      toast.success('Category created successfully!');
    },
    onError: () => toast.error('Failed to create category'),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/categories/${id}`, { method: 'DELETE', token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.warning('Category deleted.');
    },
    onError: () => toast.error('Cannot delete — category may have products linked.'),
  });

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-black text-white tracking-tight">Taxonomy: Categories</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage product categories available to all retailers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="admin-card p-5 h-fit animate-slide-up">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-rose-400" /> Add New Category
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Winter Wear"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Image URL (optional)
              </label>
              <input
                type="url"
                className="admin-input"
                placeholder="https://…"
                value={newCatImage}
                onChange={e => setNewCatImage(e.target.value)}
              />
              {newCatImage && (
                <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <img src={newCatImage} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <button
              onClick={() => { if (newCatName.trim()) createCategory.mutate(); }}
              disabled={!newCatName.trim() || createCategory.isPending}
              className="btn btn-primary w-full justify-center text-sm press-effect"
            >
              {createCategory.isPending ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
              ) : (
                <><Tag size={14} /> Create Category</>
              )}
            </button>
          </div>
        </div>

        {/* Category list */}
        <div className="lg:col-span-2 admin-card overflow-hidden animate-slide-up stagger-2">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((cat, i) => (
                  <tr key={cat.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tag size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-white">{cat.name}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Hash size={11} style={{ color: 'var(--text-muted)' }} />
                        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{cat.slug}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => { if (confirm(`Delete category "${cat.name}"?`)) deleteCategory.mutate(cat.id); }}
                        disabled={deleteCategory.isPending}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                      No categories yet. Add one on the left.
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
