import Link from 'next/link';
import { StoreCard } from '@local-fashion/ui';
import type { CategoryDto, ProductSummaryDto, StoreSummaryDto } from '@local-fashion/shared-types';
import { apiFetch, PILOT_CITY_SLUG } from '@/lib/api';
import { WishlistButton } from '@/components/WishlistButton';
import { HeroCarousel } from '@/components/HeroCarousel';
import { FlashDealTimer } from '@/components/FlashDealTimer';
import { StoriesBar } from '@/components/StoriesBar';
import { OffersBanner } from '@/components/OffersBanner';
import { Flame, Sparkles, ArrowRight, Star, TrendingUp, Zap, ShoppingBag, Plus, MapPin, Navigation } from 'lucide-react';

// Fashion fallback images per category name
const CATEGORY_FASHION_IMAGES: Record<string, string> = {
  kurtas: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80&auto=format&fit=crop',
  kurtis: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80&auto=format&fit=crop',
  dresses: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&q=80&auto=format&fit=crop',
  jeans: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80&auto=format&fit=crop',
  tops: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=80&auto=format&fit=crop',
  sarees: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80&auto=format&fit=crop',
  sneakers: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80&auto=format&fit=crop',
  footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80&auto=format&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80&auto=format&fit=crop',
  ethnic: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80&auto=format&fit=crop',
  western: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80&auto=format&fit=crop',
  shirts: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&q=80&auto=format&fit=crop',
  tshirts: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80&auto=format&fit=crop',
  suits: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&q=80&auto=format&fit=crop',
};

const DEFAULT_FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571513722275-4ad2f7c3ac1b?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=80&auto=format&fit=crop',
];

const PRODUCT_FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571513722275-4ad2f7c3ac1b?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80&auto=format&fit=crop',
];

function getCategoryImage(cat: CategoryDto, index: number): string {
  if (cat.imageUrl) return cat.imageUrl;
  const key = cat.slug?.toLowerCase() || cat.name?.toLowerCase();
  if (key && CATEGORY_FASHION_IMAGES[key]) return CATEGORY_FASHION_IMAGES[key];
  return DEFAULT_FASHION_IMAGES[index % DEFAULT_FASHION_IMAGES.length];
}

function getProductImage(p: ProductSummaryDto, index: number): string {
  if (p.images?.[0]?.url) return p.images[0].url;
  return PRODUCT_FASHION_IMAGES[index % PRODUCT_FASHION_IMAGES.length];
}

async function getHomeData() {
  const citySlug = PILOT_CITY_SLUG;
  const [productsRes, stores, categories] = await Promise.all([
    apiFetch<{ data: ProductSummaryDto[] }>(`/products?citySlug=${citySlug}&limit=16`),
    apiFetch<StoreSummaryDto[]>(`/stores?citySlug=${citySlug}`),
    apiFetch<CategoryDto[]>(`/categories`),
  ]);

  return {
    products: productsRes.data,
    deals: productsRes.data
      .filter((p) => p.discountedPrice && p.discountedPrice < p.price)
      .sort((a, b) => {
        const discountA = (a.price - a.discountedPrice!) / a.price;
        const discountB = (b.price - b.discountedPrice!) / b.price;
        return discountB - discountA;
      })
      .slice(0, 8),
    newArrivals: productsRes.data.slice().reverse().slice(0, 8),
    stores: stores.slice(0, 8),
    categories,
    citySlug,
  };
}

const trendingSearches = [
  { term: 'Kurtas', icon: '🌸' },
  { term: 'Summer Dresses', icon: '☀️' },
  { term: 'Sneakers', icon: '👟' },
  { term: 'Sarees', icon: '🪷' },
  { term: 'Crop Tops', icon: '✨' },
  { term: 'Jeans', icon: '👖' },
  { term: 'Denim', icon: '💙' },
  { term: 'Ethnic', icon: '🌺' },
];

import { PremiumProductCard } from '@/components/PremiumProductCard';
import { DynamicGreeting } from '@/components/DynamicGreeting';
import { RecentlyViewed } from '@/components/RecentlyViewed';

export default async function HomePage() {
  const { products, deals, newArrivals, stores, categories, citySlug } =
    await getHomeData();
    
  const forYouProducts = products.slice().sort(() => Math.random() - 0.5).slice(0, 4);

  return (
    <div className="space-y-7 pb-32 -mt-1">

      {/* Personalized Greeting Banner */}
      <section className="animate-fade-in px-1">
        <DynamicGreeting citySlug={PILOT_CITY_SLUG} />
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* Stories Bar */}
      <section className="animate-slide-down">
        <StoriesBar />
      </section>

      {/* Hero Carousel */}
      <section className="animate-fade-in">
        <HeroCarousel citySlug={citySlug} />
      </section>

      {/* Trending Searches */}
      <section className="animate-fade-in">
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {trendingSearches.map(({ term, icon }) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 shadow-sm transition-all hover:border-[#FF3E6C] hover:text-[#FF3E6C] active:scale-95 press-effect whitespace-nowrap"
            >
              <span>{icon}</span>
              {term}
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-black text-stone-900 tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-display), system-ui' }}
          >
            Categories
          </h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs font-bold text-[#FF3E6C]"
          >
            All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide stagger-children px-1">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="flex min-w-[64px] flex-col items-center gap-2 group animate-scale-in"
            >
              <div className="relative h-[64px] w-[64px] rounded-full p-[2px] bg-gradient-to-tr from-stone-200 to-stone-300 group-hover:from-[#FF3E6C] group-hover:to-[#FF905A] transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-[2px] border-white relative z-10">
                  <img
                    src={getCategoryImage(cat, i)}
                    alt={cat.name}
                    className="w-full h-full object-cover product-img"
                  />
                </div>
              </div>
              <span className="text-[9px] font-bold text-stone-600 text-center uppercase tracking-wide group-hover:text-[#FF3E6C] transition-colors leading-tight max-w-[64px] line-clamp-2 mt-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
      
      {/* For You AI-Recommendation Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-black text-stone-900 tracking-tight uppercase flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display), system-ui' }}
          >
            <Sparkles size={18} className="text-indigo-500 fill-indigo-100" />
            For You
          </h2>
          <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
            AI Picked
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
          {forYouProducts.map((p, i) => (
            <div key={p.id} className="w-40 shrink-0">
              <PremiumProductCard product={p} index={i} imageContainerClassName="h-52" />
            </div>
          ))}
        </div>
      </section>

      {/* Offers & Coupons */}
      <OffersBanner />

      {/* Flash Deals */}
      {deals.length > 0 && (
        <section
          className="rounded-3xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        >
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-[#FF3E6C]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2
                  className="text-lg font-black text-white flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display), system-ui' }}
                >
                  <Flame size={20} className="text-orange-400 fill-orange-400" />
                  Flash Deals
                </h2>
                <FlashDealTimer />
              </div>
              <Link
                href="/search"
                className="flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white transition bg-white/10 rounded-full px-3 py-1.5"
              >
                View All <ArrowRight size={11} />
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {deals.map((p, i) => (
                <div key={p.id} className="w-36 shrink-0">
                  <PremiumProductCard product={p} index={i} imageContainerClassName="h-44" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-black text-stone-900 tracking-tight uppercase flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display), system-ui' }}
          >
            <Zap size={18} className="text-[#FF3E6C]" />
            New In
            <span className="badge-new">FRESH</span>
          </h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs font-bold text-[#FF3E6C]"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
          {newArrivals.map((p, i) => (
            <div key={p.id} className="w-40 shrink-0">
              <PremiumProductCard product={p} index={i} imageContainerClassName="h-52" />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Near You — Premium masonry grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-black text-stone-900 tracking-tight uppercase flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display), system-ui' }}
          >
            <TrendingUp size={18} className="text-amber-500" />
            Trending
          </h2>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs font-bold text-[#FF3E6C]"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            {products.slice(0, 3).map((p, i) => (
              <PremiumProductCard key={p.id} product={p} index={i + 4} imageContainerClassName={i === 0 ? 'h-64' : 'h-48'} />
            ))}
          </div>
          <div className="flex flex-col gap-3 flex-1 min-w-0">
            {products.slice(3, 6).map((p, i) => (
              <PremiumProductCard key={p.id} product={p} index={i + 7} imageContainerClassName={i === 1 ? 'h-64' : 'h-48'} />
            ))}
          </div>
        </div>
      </section>
      {/* Style Inspiration — Editorial grid */}
      <section
        className="rounded-3xl overflow-hidden p-5 relative"
        style={{
          background: 'linear-gradient(135deg, #FFF0F3 0%, #FFF5EE 100%)',
          border: '1px solid rgba(255, 62, 108, 0.12)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-lg font-black tracking-tight uppercase"
              style={{
                fontFamily: 'var(--font-display), system-ui',
                background: 'linear-gradient(135deg, #FF3E6C 0%, #FF905A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Style Feed
            </h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Outfit inspiration from local looks
            </p>
          </div>
          <Link
            href="/discover"
            className="flex items-center gap-1 text-xs font-black text-white bg-[#FF3E6C] px-3 py-1.5 rounded-full"
          >
            Discover <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80&auto=format&fit=crop',
          ].map((url, i) => (
            <Link
              key={i}
              href="/discover"
              className={`relative rounded-xl overflow-hidden group ${
                i === 0 ? 'row-span-2' : ''
              }`}
              style={{ height: i === 0 ? '200px' : '94px' }}
            >
              <img
                src={url}
                alt={`Style ${i + 1}`}
                className="w-full h-full object-cover product-img"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Shop by Vibe */}
      <section className="px-1">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-black text-stone-900 tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-display), system-ui' }}
          >
            Shop by Vibe
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {[
            { name: 'Weekend Brunch', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80', color: 'bg-rose-100/80 text-rose-800' },
            { name: 'Office Core', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', color: 'bg-slate-100/80 text-slate-800' },
            { name: 'Party Ready', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', color: 'bg-violet-100/80 text-violet-800' },
            { name: 'Streetwear', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80', color: 'bg-emerald-100/80 text-emerald-800' },
          ].map((vibe) => (
            <Link
              key={vibe.name}
              href={`/search?q=${encodeURIComponent(vibe.name)}`}
              className="relative w-40 h-48 rounded-2xl overflow-hidden shrink-0 group"
            >
              <img src={vibe.image} alt={vibe.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className={`inline-block px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-black uppercase tracking-widest ${vibe.color}`}>
                  {vibe.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Local Stores Map Preview */}
      <section className="mx-1 mt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-card border border-stone-200/60 bg-white">
          {/* Map Background Placeholder */}
          <div className="h-48 w-full bg-stone-100 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" 
              alt="Map" 
              className="w-full h-full object-cover opacity-40 grayscale"
            />
            {/* Pulsing dots for stores */}
            <div className="absolute top-1/4 left-1/4">
              <div className="w-4 h-4 bg-[#FF3E6C] rounded-full flex items-center justify-center shadow-lg relative z-10">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 bg-[#FF3E6C] rounded-full animate-ping opacity-75" />
            </div>
            <div className="absolute top-1/2 right-1/3">
              <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            </div>
            <div className="absolute bottom-1/4 right-1/4">
              <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-xl font-black text-stone-900 leading-tight mb-1" style={{ fontFamily: 'var(--font-display), system-ui' }}>
              Explore Local Boutiques
            </h2>
            <p className="text-sm text-stone-600 font-medium mb-4">
              Find unique fashion in {stores.length}+ stores near you.
            </p>
            <Link 
              href="/stores"
              className="w-full bg-stone-900 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold hover:bg-stone-800 transition press-effect shadow-md"
            >
              <Navigation size={16} className="text-emerald-400" />
              Open Store Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
