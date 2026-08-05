import type { Metadata } from 'next';
import type { PaginatedResponse, ProductSummaryDto } from '@local-fashion/shared-types';
import { apiFetch, PILOT_CITY_SLUG } from '@/lib/api';
import { ProductGrid } from '@/components/ProductGrid';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug.replace(/-/g, ' ') };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const productsRes = await apiFetch<PaginatedResponse<ProductSummaryDto>>(
    `/products?citySlug=${PILOT_CITY_SLUG}&categorySlug=${slug}&limit=24`,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold capitalize">{slug.replace(/-/g, ' ')}</h1>
      <p className="text-sm text-stone-500">{productsRes.total} products</p>
      <ProductGrid products={productsRes.data} />
    </div>
  );
}
