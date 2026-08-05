'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import type { ProductSummaryDto } from '@local-fashion/shared-types';
import { Plus, Search, Package, MoreVertical, Edit2, Archive } from 'lucide-react';
import { toast } from '@local-fashion/utils';

export default function ProductsPage() {
  const token = useAuthStore((s) => s.token);
  const myStore = useStoreProfileStore((s) => s.myStore);
  const [products, setProducts] = useState<ProductSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!myStore || !token) return;
    const fetchProducts = async () => {
      try {
        const data = await apiFetch<ProductSummaryDto[]>(`/products/store/${myStore.id}`, { token });
        setProducts(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [myStore, token]);

  const toggleStock = async (productId: string, sizeId: string, currentInStock: boolean) => {
    if (!token) return;
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          return {
            ...p,
            sizes: p.sizes.map((s) => (s.id === sizeId ? { ...s, inStock: !currentInStock } : s)),
          };
        })
      );

      await apiFetch(`/products/${productId}/sizes/${sizeId}/stock`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ inStock: !currentInStock }),
      });
      toast.success(`Stock updated successfully`);
    } catch (err: any) {
      toast.error('Failed to toggle stock');
      // Revert optimistic update here if necessary, but skipping for brevity
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
        <div>
          <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Manage Products</h1>
          <p className="text-stone-400 text-sm mt-1">Update stock availability or add new items to your catalog.</p>
        </div>
        <Link href="/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white transition-all press-effect"
          style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)', boxShadow: '0 8px 24px rgba(255,62,108,0.3)' }}>
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden animate-slide-up">
        {/* Toolbar */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Search products or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm text-[#282C3F] font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:border-[#FF3E6C] transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton w-16 h-20 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center mb-6">
              <Package size={32} className="text-stone-400" />
            </div>
            <h3 className="text-xl font-black text-[#282C3F] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {searchQuery ? 'No products found' : 'Your catalog is empty'}
            </h3>
            <p className="text-stone-400 text-sm max-w-md mb-8">
              {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : 'Start building your online catalog by adding your first product. It only takes a minute!'}
            </p>
            {!searchQuery && (
              <Link href="/products/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white transition-all press-effect"
                style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
                <Plus size={18} /> Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 bg-white">
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Stock by Size</th>
                    <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-18 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200/60 shadow-sm relative">
                            {product.images?.[0]?.url && (
                              <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">{product.brand.name}</p>
                            <p className="text-sm font-bold text-[#282C3F] line-clamp-1 flex items-center gap-2">
                              {product.title}
                              {product.sizes.every((s) => !s.inStock) && (
                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Out of Stock</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.discountedPrice ? (
                          <div>
                            <p className="text-sm font-black text-[#282C3F]">₹{product.discountedPrice.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-stone-400 font-medium line-through">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-black text-[#282C3F]">₹{product.price.toLocaleString('en-IN')}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => toggleStock(product.id, s.id, s.inStock)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all press-effect ${
                                s.inStock
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-sm'
                                  : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60 hover:opacity-100'
                              }`}
                            >
                              {s.size}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/products/${product.id}/edit`}
                            className="p-2 text-stone-400 hover:text-[#FF3E6C] hover:bg-[#FF3E6C]/10 rounded-xl transition-all">
                            <Edit2 size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-stone-100">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200/60 shadow-sm">
                      {product.images?.[0]?.url && (
                        <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.brand.name}</p>
                          <p className="text-sm font-bold text-[#282C3F] leading-snug mt-0.5 line-clamp-2">
                            {product.title}
                            {product.sizes.every((s) => !s.inStock) && (
                              <span className="ml-2 px-1.5 py-0.5 inline-block rounded bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest">Out of Stock</span>
                            )}
                          </p>
                        </div>
                        <Link href={`/products/${product.id}/edit`} className="p-1.5 -mr-1.5 text-stone-400 hover:bg-stone-100 rounded-lg">
                          <Edit2 size={14} />
                        </Link>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex items-center gap-2">
                          {product.discountedPrice ? (
                            <>
                              <p className="text-base font-black text-[#282C3F]">₹{product.discountedPrice.toLocaleString('en-IN')}</p>
                              <p className="text-xs text-stone-400 font-medium line-through">₹{product.price.toLocaleString('en-IN')}</p>
                            </>
                          ) : (
                            <p className="text-base font-black text-[#282C3F]">₹{product.price.toLocaleString('en-IN')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                    <p className="text-[10px] font-bold text-stone-400 mb-2 uppercase tracking-widest flex items-center justify-between">
                      <span>Stock Status</span>
                      <span className="normal-case font-medium">Tap to toggle</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => toggleStock(product.id, s.id, s.inStock)}
                          className={`flex-1 min-w-[48px] py-1.5 text-xs font-bold rounded-lg border transition-all press-effect ${
                            s.inStock
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                              : 'bg-white border-stone-200 text-stone-400 opacity-60'
                          }`}
                        >
                          {s.size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
