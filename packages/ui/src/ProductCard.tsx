import type { ProductSummaryDto } from '@local-fashion/shared-types';
import { Heart, Star, TrendingUp, Clock } from 'lucide-react';

export interface ProductCardProps {
  product: ProductSummaryDto;
  onCompare?: (productId: string) => void;
  isInCompare?: boolean;
  onWishlistToggle?: (productId: string) => void;
  isInWishlist?: boolean;
  href?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

// Pseudo-random number generator based on string seed
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

export function ProductCard({ product, onCompare, isInCompare, onWishlistToggle, isInWishlist, href }: ProductCardProps) {
  const imageUrl = product.images[0]?.url ?? '/placeholder-product.png';
  const displayPrice = product.discountedPrice ?? product.price;
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - displayPrice) / product.price) * 100) : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const rand = seededRandom(product.id)();
  const rating = (3.5 + (rand % 15) / 10).toFixed(1); // 3.5 to 4.9
  const ratingCount = (rand % 500) + 12; // 12 to 511

  // Determine urgency badge
  const urgencyType = rand % 4; // 0: none, 1: viewing, 2: left in stock, 3: fast selling
  let urgencyBadge = null;
  if (product.inStock) {
    if (urgencyType === 1) {
      urgencyBadge = <div className="absolute bottom-2 left-0 bg-white/90 backdrop-blur-sm pr-2 pl-1.5 py-0.5 rounded-r-md flex items-center gap-1 text-[9px] font-bold text-rose-500 shadow-sm"><TrendingUp size={10} /> {(rand % 15) + 3} viewing</div>;
    } else if (urgencyType === 2) {
      urgencyBadge = <div className="absolute bottom-2 left-0 bg-rose-50 backdrop-blur-sm pr-2 pl-1.5 py-0.5 rounded-r-md flex items-center gap-1 text-[9px] font-bold text-rose-600 border-y border-r border-rose-100 shadow-sm"><Clock size={10} /> Only {(rand % 5) + 1} left</div>;
    }
  }

  const content = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-myntra-gray group-hover:bg-gray-100">
        <img
          src={imageUrl}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Ratings overlay */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-bold text-stone-700 shadow-sm">
          <span>{rating}</span>
          <Star size={9} className="fill-teal-500 text-teal-500" />
          <span className="text-stone-300 font-normal">|</span>
          <span className="font-medium text-stone-500">{ratingCount}</span>
        </div>

        {!product.inStock && (
          <span className="absolute top-2 left-2 rounded-sm bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-myntra-pink shadow">
            Out of stock
          </span>
        )}
        
        {urgencyBadge}

        {/* Wishlist Button */}
        {onWishlistToggle && (
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform active:scale-90`}
          >
            <Heart
              size={16}
              className={`transition-colors ${isInWishlist ? 'fill-myntra-pink text-myntra-pink' : 'text-gray-400 hover:text-myntra-dark'}`}
            />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-bold uppercase tracking-wide text-myntra-dark">{product.brand.name}</p>
        <h3 className="line-clamp-1 text-sm text-myntra-text font-light">{product.title}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold text-myntra-dark">{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <>
              <span className="text-xs text-myntra-lightText line-through">{formatPrice(product.price)}</span>
              <span className="text-xs font-bold text-myntra-orange">({discountPercent}% OFF)</span>
            </>
          )}
        </div>
        <p className="mt-1 text-[10px] text-myntra-lightText uppercase tracking-wider">{product.store.name}</p>
        {onCompare && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompare(product.id);
            }}
            className={`mt-2 rounded-sm border px-2 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors ${
              isInCompare
                ? 'border-myntra-pink bg-myntra-pink text-white'
                : 'border-gray-300 text-myntra-dark hover:border-myntra-pink hover:text-myntra-pink'
            }`}
          >
            {isInCompare ? 'Added to compare' : 'Compare'}
          </button>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="group flex flex-col overflow-hidden bg-white hover:shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 rounded-sm"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden bg-white hover:shadow-[0_2px_16px_rgba(0,0,0,0.08)] transition-shadow duration-300 rounded-sm">
      {content}
    </article>
  );
}
