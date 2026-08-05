'use client';

import { useQuery } from '@tanstack/react-query';
import type { StoreAnalyticsDto } from '@local-fashion/shared-types';
import { apiFetch, getToken } from '@/lib/api';
import { BarChart2, MousePointerClick, PhoneCall, MessageCircle, MapPin, Package, TrendingUp } from 'lucide-react';
import { toast } from '@local-fashion/utils';

export default function AnalyticsPage() {
  const token = getToken();

  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ['my-stores'],
    queryFn: () => apiFetch<{ id: string; name: string }[]>('/stores/mine', { token: token! }),
    enabled: !!token,
  });

  const storeId = stores?.[0]?.id;

  const { data: analytics, isLoading: analyticsLoading } = useQuery<StoreAnalyticsDto | null>({
    queryKey: ['analytics', storeId],
    queryFn: () => apiFetch(`/intents/analytics/store/${storeId}`, { token: token! }),
    enabled: !!token && !!storeId,
  });

  if (!token) return <p className="text-stone-500 p-8 text-center">Please login first.</p>;

  const isLoading = storesLoading || (!!storeId && analyticsLoading);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-slide-down">
        <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Analytics</h1>
        <p className="text-stone-400 text-sm mt-1">Track customer interest and engagement with your store.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)}
          </div>
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      ) : !analytics ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm animate-fade-in flex flex-col items-center">
          <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center mb-6">
            <BarChart2 size={32} className="text-stone-400" />
          </div>
          <h3 className="text-xl font-black text-[#282C3F] mb-2" style={{ fontFamily: 'var(--font-display)' }}>No data yet</h3>
          <p className="text-stone-400 text-sm">When customers start engaging with your products, data will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Intents', value: analytics.totalIntents, icon: MousePointerClick, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Direct Calls', value: analytics.callCount, icon: PhoneCall, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'WhatsApp', value: analytics.whatsappCount, icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Directions', value: analytics.directionsCount, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={stat.label} className="bg-white rounded-3xl p-5 border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</p>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                    <stat.icon size={14} />
                  </div>
                </div>
                <p className="text-3xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FF3E6C]/10 text-[#FF3E6C] flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>Top Products</h2>
                <p className="text-xs text-stone-400 mt-0.5">Most engaged items by customers</p>
              </div>
            </div>

            {analytics.topProducts.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <Package size={24} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No product intents recorded yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {analytics.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between p-4 rounded-2xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 font-bold text-xs flex items-center justify-center border border-stone-200">
                        #{i + 1}
                      </div>
                      <span className="font-bold text-[#282C3F] text-sm">{p.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-[#FF3E6C]">{p.count}</span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Taps</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
