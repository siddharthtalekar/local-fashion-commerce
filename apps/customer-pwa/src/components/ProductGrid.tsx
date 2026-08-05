'use client';

import { ProductCard } from '@local-fashion/ui';
import type { ProductSummaryDto } from '@local-fashion/shared-types';
import { useCompareStore } from '@/store/compare';
import { useWishlistStore } from '@/store/wishlist';
import { useAuthStore } from '@/store/auth';

interface ProductGridProps {
  products: ProductSummaryDto[];
  layout?: 'grid' | 'horizontal';
}

export function ProductGrid({ products, layout = 'grid' }: ProductGridProps) {
  const toggleCompare = useCompareStore((s) => s.toggle);
  const isInCompare = useCompareStore((s) => s.isInCompare);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const token = useAuthStore((s) => s.token);
  const setLoginModalOpen = useAuthStore((s) => s.setLoginModalOpen);

  const handleWishlistToggle = (productId: string) => {
    if (!token) {
      setLoginModalOpen(true);
      return;
    }
    toggleWishlist(productId, token);
  };

  if (layout === 'horizontal') {
    return (
      <div className="flex gap-4 w-full">
        {products.map((product) => (
          <div key={product.id} className="w-[160px] min-w-[160px] md:w-[200px] md:min-w-[200px]">
            <ProductCard
              product={product}
              href={`/products/${product.id}`}
              onCompare={toggleCompare}
              isInCompare={isInCompare(product.id)}
              onWishlistToggle={handleWishlistToggle}
              isInWishlist={isInWishlist(product.id)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          href={`/products/${product.id}`}
          onCompare={toggleCompare}
          isInCompare={isInCompare(product.id)}
          onWishlistToggle={handleWishlistToggle}
          isInWishlist={isInWishlist(product.id)}
        />
      ))}
    </div>
  );
}
