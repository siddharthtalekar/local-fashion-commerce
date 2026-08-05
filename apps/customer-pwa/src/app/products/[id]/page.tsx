import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ProductDetailDto, ProductSummaryDto } from '@local-fashion/shared-types';
import { apiFetch, PILOT_CITY_SLUG } from '@/lib/api';
import { ContactButtons } from '@/components/ContactButtons';
import { CompareButton } from '@/components/CompareButton';
import { ProductActions } from '@/components/ProductActions';
import { WishlistButton } from '@/components/WishlistButton';
import { ShareButton } from '@/components/ShareButton';
import { PremiumProductCard } from '@/components/PremiumProductCard';
import { ChevronDown, Store, Star, Shield, RotateCcw, Truck, ArrowLeft, Images, User } from 'lucide-react';
import { ImageCarousel } from '@/components/ImageCarousel';
import { BackButton } from '@/components/BackButton';
import { TrackRecentView } from '@/components/TrackRecentView';

interface Props {
  params: Promise<{ id: string }>;
}

const COLOR_MAP: Record<string, string> = {
  'red': '#ef4444',
  'blue': '#3b82f6',
  'green': '#22c55e',
  'yellow': '#eab308',
  'black': '#171717',
  'white': '#ffffff',
  'pink': '#ec4899',
  'purple': '#a855f7',
  'navy': '#1e3a8a',
  'olive': '#3f6212',
  'grey': '#737373',
  'brown': '#78350f',
  'beige': '#f5f5dc',
  'orange': '#f97316',
};

// FASHION_FALLBACK_IMAGES removed or kept outside...
const FASHION_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop',
];

async function getProduct(id: string): Promise<ProductDetailDto | null> {
  try {
    return await apiFetch<ProductDetailDto>(`/products/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.title,
    description: product.description ?? `${product.title} at ${product.store.name}`,
    openGraph: {
      title: product.title,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  
  // Fetch product and similar products in parallel
  const [product, similarProductsRes] = await Promise.all([
    getProduct(id),
    apiFetch<{ data: ProductSummaryDto[] }>(`/products?citySlug=${PILOT_CITY_SLUG}&limit=4`).catch(() => ({ data: [] }))
  ]);
  
  if (!product) notFound();
  
  const similarProducts = similarProductsRes.data.filter(p => p.id !== product.id).slice(0, 4);

  const displayPrice = product.discountedPrice ?? product.price;
  const hasDiscount =
    product.discountedPrice != null && product.discountedPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - displayPrice) / product.price) * 100)
    : 0;

  // Use fashion fallbacks if no images
  const galleryImages =
    product.images.length > 0
      ? product.images.map((img) => img.url)
      : FASHION_FALLBACK_IMAGES;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: galleryImages,
    brand: product.brand.name,
    offers: {
      '@type': 'Offer',
      price: displayPrice,
      priceCurrency: 'INR',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="pb-36 -mx-4 lg:mx-0 animate-fade-in">
      <TrackRecentView product={product} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Full-bleed image gallery */}
      <div className="relative">
        {/* Back button + floating actions */}
        <div className="absolute top-4 left-4 z-20">
          <BackButton />
        </div>
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5">
          <ShareButton
            title={product.title}
            text={product.description || ''}
            url={`/products/${product.slug}`}
          />
          <WishlistButton productId={product.id} />
        </div>

        <ImageCarousel images={galleryImages} altPrefix={product.title} />
      </div>

      {/* Product details */}
      <div className="px-4 space-y-6 mt-6 lg:px-0">

        {/* Brand + Title + Price */}
        <div>
          {/* Brand badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 mb-2">
            <span className="text-xs font-black text-stone-600 uppercase tracking-widest">
              {product.brand.name}
            </span>
          </div>

          <h1
            className="text-xl font-bold text-stone-900 leading-snug"
            style={{ fontFamily: 'var(--font-display), system-ui' }}
          >
            {product.title}
          </h1>

          {/* Rating placeholder */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-green-50 border border-green-100 px-2 py-1 rounded-lg">
              <Star size={11} className="text-green-600 fill-green-600" />
              <span className="text-xs font-black text-green-700">4.3</span>
            </div>
            <span className="text-xs text-stone-400 font-medium">124 reviews</span>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-3">
            <span
              className="text-3xl font-black text-stone-900"
              style={{ fontFamily: 'var(--font-display), system-ui' }}
            >
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-stone-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="badge-hot">{discountPercent}% OFF</span>
              </>
            )}
          </div>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <Shield size={11} />
            inclusive of all taxes
          </p>
        </div>

        {/* In-stock status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              product.inStock ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'
            }`}
          />
          <span
            className={`text-sm font-bold ${
              product.inStock ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {product.inStock ? 'In Stock — Ready for pickup' : 'Out of Stock'}
          </span>
        </div>

        {/* Size & Color selector + Add to Cart (sticky on mobile) */}
        <ProductActions productId={product.id} sizes={product.sizes} colors={product.colors} />

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Shield, label: '100% Original', color: 'text-emerald-600' },
            { icon: RotateCcw, label: '14 Day Returns', color: 'text-blue-600' },
            { icon: Truck, label: 'Local Pickup', color: 'text-[#FF3E6C]' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <Icon size={18} className={color} />
              <span className="text-[10px] font-bold text-stone-600 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Contact buttons */}
        <ContactButtons
          store={{
            id: product.store.id,
            name: product.store.name,
            phone: product.store.phone,
            whatsapp: product.store.whatsapp,
            latitude: product.store.latitude,
            longitude: product.store.longitude,
          }}
          product={{ id: product.id, title: product.title }}
        />

        {/* Store card */}
        <div>
          <h3 className="font-black uppercase tracking-widest text-xs text-stone-500 mb-3 flex items-center gap-1.5">
            <Store size={13} />
            Sold By
          </h3>
          <Link
            href={`/stores/${product.store.id}`}
            className="flex items-start gap-4 p-4 rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition press-effect"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF3E6C] to-[#FF905A] rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {product.store.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-stone-900">{product.store.name}</h4>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{product.store.address}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center gap-0.5 bg-green-100 text-green-700 text-[10px] font-black px-1.5 py-0.5 rounded">
                  <Star size={9} className="fill-green-600" /> 4.5
                </span>
                <span className="text-[10px] text-stone-400 font-medium">100% Original</span>
              </div>
            </div>
            <span className="text-[#FF3E6C] font-black text-xs bg-rose-50 px-3 py-1.5 rounded-full self-center flex-shrink-0">
              Visit →
            </span>
          </Link>
        </div>

        <hr className="border-stone-100" />

        {/* Product details accordion */}
        <div className="space-y-3">
          <details className="group [&_summary::-webkit-details-marker]:hidden bg-stone-50 rounded-2xl px-4 py-3" open>
            <summary className="flex cursor-pointer items-center justify-between font-black uppercase tracking-widest text-xs text-stone-700">
              Product Details
              <ChevronDown className="h-4 w-4 transition duration-300 group-open:-rotate-180 text-stone-400" />
            </summary>
            <div className="mt-3 text-sm text-stone-600 leading-relaxed">
              {product.description || 'Premium quality product sourced from trusted local boutiques.'}
              {product.colors.length > 0 && (
                <p className="mt-2"><strong className="text-stone-800">Colors:</strong> {product.colors.join(', ')}</p>
              )}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-stone-100 text-stone-600 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </details>

          <details className="group [&_summary::-webkit-details-marker]:hidden bg-stone-50 rounded-2xl px-4 py-3">
            <summary className="flex cursor-pointer items-center justify-between font-black uppercase tracking-widest text-xs text-stone-700">
              Delivery & Returns
              <ChevronDown className="h-4 w-4 transition duration-300 group-open:-rotate-180 text-stone-400" />
            </summary>
            <div className="mt-3 text-sm text-stone-600">
              <ul className="space-y-2.5">
                {[
                  '✓ In-store pickup available today',
                  '✓ Pay on delivery / in-store',
                  '✓ Easy 14-day returns at the store',
                  '✓ Exchange available for size issues',
                ].map((item) => (
                  <li key={item} className="text-stone-700">{item}</li>
                ))}
              </ul>
            </div>
          </details>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {product.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-xs font-bold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition press-effect"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        
        <hr className="border-stone-100" />
        
        {/* Customer Reviews */}
        <div className="mt-8 px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg text-stone-900" style={{ fontFamily: 'var(--font-display), system-ui' }}>
              Customer Reviews
            </h3>
            <span className="text-sm font-bold text-[#FF3E6C]">View All (124)</span>
          </div>
          <p className="text-xs text-stone-500 italic mb-4">Note: These are sample reviews.</p>
          <div className="space-y-4">
            {[
              { name: 'Priya S.', rating: 5, date: '2 days ago', comment: 'Absolutely love the quality. Fits perfectly and looks exactly like the pictures!' },
              { name: 'Neha Gupta', rating: 4, date: '1 week ago', comment: 'Great material, but size runs a bit small. Would recommend sizing up.' },
            ].map((review, i) => (
              <div key={i} className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center">
                      <User size={12} className="text-stone-500" />
                    </div>
                    <span className="text-sm font-bold text-stone-900">{review.name}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">{review.date}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={10} className={idx < review.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'} />
                  ))}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-700 hover:bg-stone-50 transition press-effect">
            View All 124 Reviews
          </button>
        </div>
        
        {/* You Might Also Like */}
        {similarProducts.length > 0 && (
          <div className="pt-4 pb-4">
            <h2 
              className="text-lg font-black text-stone-900 tracking-tight uppercase mb-4"
              style={{ fontFamily: 'var(--font-display), system-ui' }}
            >
              You Might Also Like
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {similarProducts.map((p, i) => (
                <div key={p.id} className="w-36 shrink-0">
                  <PremiumProductCard product={p} index={i} imageContainerClassName="h-44" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
