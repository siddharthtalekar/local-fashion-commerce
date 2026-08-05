'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch, getToken } from '@/lib/api';
import { toast } from '@local-fashion/utils';
import { Package, Search, Trash2, ExternalLink, IndianRupee, Image as ImageIcon } from 'lucide-react';

interface AdminProduct {
  id: string;
  title: string;
  price: number;
  discountedPrice: number | null;
  createdAt: string;
  store: { id: string; name: string };
  brand: { name: string };
  category: { name: string };
  images: { url: string }[];
}

interface ProductsResponse {
  items: AdminProduct[];
  total: number;
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&q=60&fit=crop';

export default function AdminProductsPage() {
  const token = getToken();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const TAKE = 50;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', skip],
    queryFn: () => apiFetch<ProductsResponse>(`/admin/products?skip=${skip}&take=${TAKE}`, { token: token! }),
    enabled: !!token,
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/products/${id}`, { method: 'DELETE', token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.warning('Product removed from platform.');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  if (!token) return null;

  const filtered = data?.items?.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.store.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Platform Products</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            All products listed across all stores. Total: {data?.total ?? '…'}
          </p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by title, store, brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-9"
          />
        </div>
      </div>

      <div className="admin-card overflow-hidden animate-fade-in">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-2)' }}>
              <Package size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No products found</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Store</th>
                    <th>Brand / Category</th>
                    <th>Price</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((product, i) => (
                    <tr key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border)' }}>
                            {product.images[0] ? (
                              <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                                <ImageIcon size={14} style={{ color: 'var(--text-muted)' }} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm leading-tight max-w-[200px] truncate">{product.title}</p>
                            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{product.id.slice(0, 14)}…</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-semibold text-white text-sm">{product.store.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(product.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </td>
                      <td>
                        <p className="text-sm text-white font-medium">{product.brand.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{product.category.name}</p>
                      </td>
                      <td>
                        <p className="font-black text-white text-sm">
                          ₹{(product.discountedPrice ?? product.price).toLocaleString('en-IN')}
                        </p>
                        {product.discountedPrice && (
                          <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${product.title}" from the platform? This cannot be undone.`)) {
                              deleteProduct.mutate(product.id);
                            }
                          }}
                          disabled={deleteProduct.isPending}
                          className="text-slate-600 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
                          title="Remove product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.total > TAKE && (
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Showing {skip + 1}–{Math.min(skip + TAKE, data.total)} of {data.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSkip(Math.max(0, skip - TAKE))}
                    disabled={skip === 0}
                    className="btn btn-ghost text-xs"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setSkip(skip + TAKE)}
                    disabled={skip + TAKE >= data.total}
                    className="btn btn-ghost text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
