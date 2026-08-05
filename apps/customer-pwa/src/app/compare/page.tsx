'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ProductDetailDto } from '@local-fashion/shared-types';
import { API_URL } from '@/lib/api';
import { useCompareStore } from '@/store/compare';

export default function ComparePage() {
  const productIds = useCompareStore((s) => s.productIds);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  const { data: products, isLoading } = useQuery<ProductDetailDto[]>({
    queryKey: ['compare', productIds.join(',')],
    queryFn: () =>
      fetch(`${API_URL}/products/compare?ids=${productIds.join(',')}`).then((r) => r.json()),
    enabled: productIds.length > 0,
  });

  if (productIds.length === 0) {
    return (
      <div className="py-24 text-center px-4 min-h-screen bg-neutral-50/50">
        <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-neutral-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Compare products</h1>
        <p className="mt-2 text-neutral-500 font-medium">Add up to 4 products to compare side by side.</p>
        <Link href="/search" className="mt-8 inline-block px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full active:scale-95 transition-transform">
          Start exploring
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-neutral-50/50">
      <div className="bg-white px-4 py-6 shadow-sm mb-6 border-b border-neutral-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Compare</h1>
            <p className="text-sm font-medium text-neutral-500">{productIds.length} items selected</p>
          </div>
          <button 
            onClick={clear}
            className="text-sm font-bold text-rose-600 px-4 py-2 rounded-lg bg-rose-50 active:bg-rose-100 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex gap-4">
              {[1, 2].map(i => (
                <div key={i} className="w-48 h-64 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="overflow-x-auto pb-4 scrollbar-hide border border-neutral-100 rounded-lg bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-r border-neutral-100 bg-neutral-50 min-w-[120px]">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Product</span>
                  </th>
                  {products.map(p => (
                    <th key={p.id} className="p-4 border-b border-r border-neutral-100 min-w-[200px] max-w-[240px] relative align-top">
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-neutral-400 hover:text-myntra-pink shadow-sm active:scale-95 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <Link href={`/products/${p.id}`} className="block h-40 w-full rounded-md overflow-hidden mb-3 bg-neutral-100">
                        {p.images[0] ? (
                          <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">No Image</div>
                        )}
                      </Link>
                      <Link href={`/products/${p.id}`} className="block">
                        <h3 className="font-bold text-myntra-dark leading-tight text-sm line-clamp-2">{p.title}</h3>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-r border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">Price</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 border-b border-r border-neutral-100 font-bold text-base text-myntra-dark">
                      ₹{(p.discountedPrice ?? p.price).toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 border-b border-r border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">Brand</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 border-b border-r border-neutral-100 font-semibold text-sm text-neutral-700">
                      {p.brand.name}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 border-b border-r border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">Store</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 border-b border-r border-neutral-100 font-semibold text-sm text-myntra-pink">
                      <Link href={`/stores/${p.store.id}`} className="hover:underline">{p.store.name}</Link>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 border-b border-r border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">Sizes</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 border-b border-r border-neutral-100 text-sm font-medium text-neutral-700">
                      {p.sizes.filter((s) => s.inStock).map((s) => s.size).join(', ') || 'None'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 border-r border-neutral-100 bg-neutral-50 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 border-r border-neutral-100">
                      {p.inStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-green-700 bg-green-50 text-[10px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-myntra-pink bg-rose-50 text-[10px] font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-myntra-pink"></span> Out of stock
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
