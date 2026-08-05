import Link from 'next/link';
import { ArrowLeft, MapPin, Search, Star } from 'lucide-react';
import { StoreCard } from '@local-fashion/ui';
import type { StoreSummaryDto } from '@local-fashion/shared-types';
import { apiFetch, PILOT_CITY_SLUG } from '@/lib/api';

async function getStores(q: string) {
  const stores = await apiFetch<StoreSummaryDto[]>(`/stores?citySlug=${PILOT_CITY_SLUG}`);
  if (q) {
    const query = q.toLowerCase();
    return stores.filter(s => s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query));
  }
  return stores;
}

export default async function StoresPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const stores = await getStores(q || '');

  return (
    <div className="pb-24 min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-900 press-effect">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-black text-lg text-stone-900 tracking-tight" style={{ fontFamily: 'var(--font-display), system-ui' }}>
              All Boutiques
            </h1>
            <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <MapPin size={10} className="text-[#FF3E6C]" /> Exploring in {PILOT_CITY_SLUG.toUpperCase()}
            </p>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="p-4 bg-gradient-to-br from-stone-900 to-stone-800 text-white animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3E6C] rounded-full blur-3xl opacity-20" />
        <h2 className="text-2xl font-black mb-1" style={{ fontFamily: 'var(--font-display), system-ui' }}>
          Discover Local Style
        </h2>
        <p className="text-sm text-stone-300 max-w-[80%] mb-4">
          Shop directly from the best boutiques and hidden gems in your city.
        </p>
        
        {/* Search */}
        <form action="/stores" method="GET" className="relative z-10">
          <div className="relative">
            <input 
              type="text" 
              name="q"
              defaultValue={q}
              placeholder="Search stores by name or location..." 
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-stone-300 focus:outline-none focus:bg-white/20 transition-all backdrop-blur-sm text-sm"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
          </div>
        </form>
      </div>

      <div className="p-4">
        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => (
            <div key={store.id} className="animate-slide-up" style={{ animationFillMode: 'both' }}>
              <StoreCard store={store} href={`/stores/${store.id}`} />
            </div>
          ))}
          {stores.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                <Star size={24} className="text-stone-300" />
              </div>
              <h3 className="font-bold text-stone-900">No boutiques found</h3>
              <p className="text-stone-500 text-sm mt-1">We couldn't find any stores in this city right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
