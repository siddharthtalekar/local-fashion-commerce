'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import type { BrandDto, CategoryDto, PaginatedResponse, ProductSummaryDto } from '@local-fashion/shared-types';
import { API_URL, PILOT_CITY_SLUG } from '@/lib/api';
import { WishlistButton } from '@/components/WishlistButton';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { Search, X, SlidersHorizontal, ArrowLeft, TrendingUp, Clock, Mic, Grid3X3, List, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const FASHION_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571513722275-4ad2f7c3ac1b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80&auto=format&fit=crop',
];

const TRENDING_SEARCHES = [
  { term: 'Kurtas', icon: '🌸', count: '2.4k' },
  { term: 'Summer Dresses', icon: '☀️', count: '1.8k' },
  { term: 'Sneakers', icon: '👟', count: '3.1k' },
  { term: 'Sarees', icon: '🪷', count: '1.2k' },
  { term: 'Crop Tops', icon: '✨', count: '980' },
  { term: 'Jeans', icon: '👖', count: '2.7k' },
  { term: 'Ethnic Wear', icon: '🌺', count: '1.5k' },
  { term: 'Western Wear', icon: '👗', count: '890' },
];

const SORT_OPTIONS = [
  { label: 'Popular', value: '' },
  { label: 'Price: Low', value: 'price_asc' },
  { label: 'Price: High', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
  { label: 'Discount', value: 'discount' },
];

import { PremiumProductCard } from '@/components/PremiumProductCard';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryDto[];
  brands: BrandDto[];
  categorySlug: string;
  setCategorySlug: (s: string) => void;
  brandSlug: string;
  setBrandSlug: (s: string) => void;
  size: string;
  setSize: (s: string) => void;
  minPrice: string;
  setMinPrice: (s: string) => void;
  maxPrice: string;
  setMaxPrice: (s: string) => void;
  onClear: () => void;
}

function FilterSheet({
  open, onClose,
  categories, brands,
  categorySlug, setCategorySlug,
  brandSlug, setBrandSlug,
  size, setSize,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  onClear,
}: FilterSheetProps) {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-lg bottom-sheet-enter max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-stone-600" />
            <h2 className="font-black text-stone-900 text-lg" style={{ fontFamily: 'var(--font-display), system-ui' }}>Filters</h2>
          </div>
          <button onClick={onClear} className="text-sm font-bold text-[#FF3E6C] hover:text-rose-700 transition">Clear All</button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 px-5 py-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategorySlug('')} className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all ${!categorySlug ? 'bg-[#FF3E6C] text-white border-[#FF3E6C] shadow-brand' : 'bg-white text-stone-600 border-stone-200 hover:border-[#FF3E6C]'}`}>All</button>
              {categories?.map((c: CategoryDto) => (
                <button key={c.id} onClick={() => setCategorySlug(c.slug)} className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all ${categorySlug === c.slug ? 'bg-[#FF3E6C] text-white border-[#FF3E6C] shadow-brand' : 'bg-white text-stone-600 border-stone-200 hover:border-[#FF3E6C]'}`}>{c.name}</button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">Brand</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setBrandSlug('')} className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all ${!brandSlug ? 'bg-[#FF3E6C] text-white border-[#FF3E6C]' : 'bg-white text-stone-600 border-stone-200'}`}>All</button>
              {brands?.map((b: BrandDto) => (
                <button key={b.id} onClick={() => setBrandSlug(b.slug)} className={`px-3 py-2 rounded-2xl border text-xs font-bold transition-all ${brandSlug === b.slug ? 'bg-[#FF3E6C] text-white border-[#FF3E6C]' : 'bg-white text-stone-600 border-stone-200'}`}>{b.name}</button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(size === s ? '' : s)}
                  className={`min-w-[52px] h-12 px-3 rounded-2xl border text-sm font-bold transition-all ${size === s ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-3">Price Range</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-stone-500 font-medium mb-1 block">Min (₹)</label>
                <input type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm font-medium focus:border-[#FF3E6C] focus:ring-1 focus:ring-[#FF3E6C]/20 outline-none transition" />
              </div>
              <span className="text-stone-300 font-bold mt-5">—</span>
              <div className="flex-1">
                <label className="text-xs text-stone-500 font-medium mb-1 block">Max (₹)</label>
                <input type="number" placeholder="99999" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-3 py-3 text-sm font-medium focus:border-[#FF3E6C] focus:ring-1 focus:ring-[#FF3E6C]/20 outline-none transition" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-stone-100 pb-safe flex-shrink-0 bg-white">
          <button onClick={onClose}
            className="w-full rounded-2xl py-4 text-sm font-black text-white press-effect"
            style={{ background: 'linear-gradient(135deg, #FF3E6C 0%, #FF6B35 100%)', boxShadow: '0 8px 24px rgba(255, 62, 108, 0.35)' }}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') ?? '';

  const [q, setQ] = useState(initialQ);
  const [debouncedQ, setDebouncedQ] = useState(initialQ);
  const [categorySlug, setCategorySlug] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [size, setSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [listView, setListView] = useState(false);
  const [page, setPage] = useState(1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: () => fetch(`${API_URL}/categories`).then((r) => r.json()),
  });

  const { data: brands } = useQuery<BrandDto[]>({
    queryKey: ['brands'],
    queryFn: () => fetch(`${API_URL}/brands`).then((r) => r.json()),
  });

  const params = new URLSearchParams({ citySlug: PILOT_CITY_SLUG, limit: '24', page: page.toString() });
  if (debouncedQ) params.set('q', debouncedQ);
  if (categorySlug) params.set('categorySlug', categorySlug);
  if (brandSlug) params.set('brandSlug', brandSlug);
  if (size) params.set('size', size);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);

  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<ProductSummaryDto>>({
    queryKey: ['products', params.toString()],
    queryFn: () => fetch(`${API_URL}/products?${params}`).then((r) => r.json()),
  });
  
  // Accumulated products for infinite scroll
  const [allProducts, setAllProducts] = useState<ProductSummaryDto[]>([]);
  useEffect(() => {
    if (data?.data) {
      if (page === 1) setAllProducts(data.data);
      else setAllProducts(prev => [...prev, ...data.data]);
    }
  }, [data]);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, categorySlug, brandSlug, size, minPrice, maxPrice]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
      if (q) saveSearch(q);
    }, 400);
    return () => clearTimeout(handler);
  }, [q]);

  // Load recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lf_recent_searches');
      if (raw) setRecentSearches(JSON.parse(raw).slice(0, 5));
    } catch {}
  }, []);

  const saveSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem('lf_recent_searches', JSON.stringify(updated)); } catch {}
  }, [recentSearches]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSearch(q);
  };

  const clearFilters = () => {
    setCategorySlug('');
    setBrandSlug('');
    setSize('');
    setMinPrice('');
    setMaxPrice('');
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQ(transcript);
      saveSearch(transcript);
    };
    
    recognition.start();
  };

  const activeFilterCount = [categorySlug, brandSlug, size, minPrice, maxPrice].filter(Boolean).length;
  const showEmptyState = !debouncedQ && !categorySlug && !brandSlug && activeFilterCount === 0;

  // Sort products client-side
  const sortedProducts = [...allProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price);
    if (sortBy === 'price_desc') return (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price);
    if (sortBy === 'discount') {
      const da = a.discountedPrice ? (a.price - a.discountedPrice) / a.price : 0;
      const db = b.discountedPrice ? (b.price - b.discountedPrice) / b.price : 0;
      return db - da;
    }
    return 0;
  });

  useEffect(() => {
    if (inputRef.current && !q) inputRef.current.focus();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Search Header */}
      <div className="-mx-4 px-4 pb-2.5 -mt-4 pt-2.5 sticky top-[57px] z-30 bg-[#FAFAF9]">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search for clothes, brands, stores..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-2xl bg-stone-100 hover:bg-stone-100/80 pl-[40px] pr-10 py-2.5 text-sm text-stone-900 font-medium outline-none focus:ring-2 focus:ring-[#FF3E6C]/30 focus:bg-white transition-all"
          />
          {q ? (
            <button type="button" onClick={() => setQ('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400">
              <X size={15} />
            </button>
          ) : (
            <button type="button" onClick={startVoiceSearch} className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#FF3E6C]/10 text-[#FF3E6C]'}`}>
              <Mic size={12} className={isListening ? 'text-white' : 'text-[#FF3E6C]'} />
            </button>
          )}
        </form>
        
        {/* Visual Category Quick-Filters */}
        {!showEmptyState && categories && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-3">
            <button
              onClick={() => setCategorySlug('')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${!categorySlug ? 'bg-[#FF3E6C] text-white border-[#FF3E6C] shadow-brand' : 'bg-white text-stone-600 border-stone-200'}`}
            >
              All
            </button>
            {categories.slice(0, 6).map((c: CategoryDto) => (
              <button
                key={c.id}
                onClick={() => setCategorySlug(c.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${categorySlug === c.slug ? 'bg-[#FF3E6C] text-white border-[#FF3E6C] shadow-brand' : 'bg-white text-stone-600 border-stone-200'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state with trending & recent */}
      {showEmptyState && (
        <div className="space-y-5 animate-fade-in">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className="text-stone-400" />
                <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest">Recent</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button key={s} onClick={() => setQ(s)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-100 text-stone-700 text-xs font-bold press-effect hover:bg-stone-200 transition">
                    <Clock size={10} className="text-stone-400" />
                    {s}
                    <X size={10} className="text-stone-400" onClick={(e) => {
                      e.preventDefault();
                      const updated = recentSearches.filter(r => r !== s);
                      setRecentSearches(updated);
                      try { localStorage.setItem('lf_recent_searches', JSON.stringify(updated)); } catch {}
                    }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#FF3E6C]" />
              <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest">Trending Now</h3>
            </div>
            <div className="space-y-0">
              {TRENDING_SEARCHES.map((item, i) => (
                <button key={item.term} onClick={() => { setQ(item.term); saveSearch(item.term); }}
                  className="flex items-center gap-3 w-full py-3 border-b border-stone-100 last:border-0 press-effect">
                  <span className="text-xl">{item.icon}</span>
                  <span className="flex-1 text-sm font-semibold text-stone-800 text-left">{item.term}</span>
                  <span className="text-xs text-stone-400 font-medium">{item.count} searches</span>
                  <TrendingUp size={12} className="text-stone-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex gap-2 flex-wrap animate-slide-up">
          {categorySlug && <span className="flex items-center gap-1 px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full">{categorySlug} <button onClick={() => setCategorySlug('')}><X size={10} /></button></span>}
          {brandSlug && <span className="flex items-center gap-1 px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full">{brandSlug} <button onClick={() => setBrandSlug('')}><X size={10} /></button></span>}
          {size && <span className="flex items-center gap-1 px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full">Size: {size} <button onClick={() => setSize('')}><X size={10} /></button></span>}
          {(minPrice || maxPrice) && <span className="flex items-center gap-1 px-3 py-1 bg-stone-900 text-white text-xs font-bold rounded-full">₹{minPrice || '0'}–₹{maxPrice || '∞'} <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X size={10} /></button></span>}
        </div>
      )}

      {/* Results header + sort + view toggle */}
      {(q || activeFilterCount > 0) && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-stone-900" style={{ fontFamily: 'var(--font-display), system-ui' }}>
              {q ? `"${q}"` : 'Products'}
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {isLoading ? 'Searching...' : `${data?.total ?? 0} items`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className={`relative flex items-center justify-center p-2 rounded-xl border transition-all ${activeFilterCount > 0 ? 'bg-[#FF3E6C] text-white border-[#FF3E6C] shadow-brand' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'}`}
            >
              <SlidersHorizontal size={16} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-stone-900 px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-xl pl-3 pr-7 py-2 outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
            {/* Grid/List toggle */}
            <button
              onClick={() => setListView((v) => !v)}
              className="p-2 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition"
            >
              {listView ? <Grid3X3 size={16} /> : <List size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Grid / Results */}
      {!showEmptyState && (
        isLoading && page === 1 ? (
          <ProductGridSkeleton count={8} />
        ) : sortedProducts.length > 0 ? (
          <>
            <div className={`animate-fade-in ${listView ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'}`}>
              {sortedProducts.map((p, i) => (
                <PremiumProductCard key={`${p.id}-${i}`} product={p} index={i} listView={listView} />
              ))}
            </div>
            {data && data.page < data.totalPages && (
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={isFetching}
                className="w-full py-4 rounded-2xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition press-effect mt-6 flex justify-center items-center gap-2"
              >
                {isFetching ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
                    Loading more...
                  </>
                ) : 'Load More Products'}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-stone-100 shadow-card mt-4 animate-scale-in px-6">
            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <span className="text-4xl">🔎</span>
            </div>
            <h2 className="text-xl font-black text-stone-900 mb-2" style={{ fontFamily: 'var(--font-display), system-ui' }}>We couldn't find that</h2>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              We couldn't find anything matching your current filters. Try adjusting your search or clearing filters.
            </p>
            
            {/* Smart suggestions */}
            <div className="w-full bg-stone-50 rounded-2xl p-4 mb-6 text-left">
              <h3 className="text-xs font-black uppercase text-stone-500 mb-3">Try searching for</h3>
              <div className="flex flex-wrap gap-2">
                {['Summer Collection', 'Trending Dresses', 'Casual Wear', 'New Arrivals'].map(suggestion => (
                  <button 
                    key={suggestion}
                    onClick={() => { setQ(suggestion); clearFilters(); }}
                    className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-700 hover:border-[#FF3E6C] hover:text-[#FF3E6C] transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={clearFilters} className="text-white font-bold py-3.5 px-8 rounded-2xl shadow-brand press-effect w-full"
              style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
              Clear All Filters
            </button>
          </div>
        )
      )}

        <FilterSheet 
          open={showFilters} 
          onClose={() => setShowFilters(false)}
          categories={categories ?? []}
          brands={brands ?? []}
          categorySlug={categorySlug}
          setCategorySlug={setCategorySlug}
          brandSlug={brandSlug}
          setBrandSlug={setBrandSlug}
          size={size}
          setSize={setSize}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onClear={clearFilters}
        />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton count={8} />}>
      <SearchContent />
    </Suspense>
  );
}
