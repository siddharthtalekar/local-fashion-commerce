import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ProductSummaryDto, StoreDetailDto } from '@local-fashion/shared-types';
import { apiFetch, PILOT_CITY_SLUG } from '@/lib/api';
import { ContactButtons } from '@/components/ContactButtons';
import { ProductGrid } from '@/components/ProductGrid';

interface Props {
  params: Promise<{ id: string }>;
}

async function getStore(id: string): Promise<StoreDetailDto | null> {
  try {
    return await apiFetch<StoreDetailDto>(`/stores/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const store = await getStore(id);
  if (!store) return { title: 'Store not found' };
  return {
    title: store.name,
    description: store.description ?? `${store.name} — ${store.address}`,
  };
}

export default async function StorePage({ params }: Props) {
  const { id } = await params;
  const store = await getStore(id);
  if (!store) notFound();

  const productsRes = await apiFetch<{ data: ProductSummaryDto[] }>(
    `/products?citySlug=${PILOT_CITY_SLUG}&limit=50`,
  );
  const storeProducts = productsRes.data.filter((p) => p.store.id === store.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    address: store.address,
    telephone: store.phone,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: store.latitude,
      longitude: store.longitude,
    },
  };

  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&q=${store.latitude},${store.longitude}`;

  return (
    <div className="pb-24 min-h-screen bg-neutral-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <div className="relative h-64 md:h-80 w-full bg-neutral-200">
        {store.coverImageUrl ? (
          <img
            src={store.coverImageUrl}
            alt={store.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-teal-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">{store.name}</h1>
            {store.verificationStatus === 'approved' && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-white/90 text-sm font-medium line-clamp-1">{store.address}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-8">
        
        {/* Actions */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
          <ContactButtons store={store} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm bg-white">
            <iframe
              title={`Map of ${store.name}`}
              src={mapSrc}
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Hours */}
          {store.openingHours && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-neutral-900 mb-3 tracking-tight">Opening hours</h2>
              <dl className="space-y-2 text-sm">
                {Object.entries(store.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center capitalize py-1 border-b border-neutral-50 last:border-0">
                    <dt className="text-neutral-500 font-medium">{day}</dt>
                    <dd className="font-semibold text-neutral-900">{String(hours)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          
          {/* Tags */}
          {store.categoryTags.length > 0 && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-neutral-900 mb-3 tracking-tight">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {store.categoryTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-neutral-100 text-neutral-800 px-3 py-1 text-xs font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">Available in store</h2>
            <span className="text-sm font-semibold text-neutral-500">{storeProducts.length} items</span>
          </div>
          
          {storeProducts.length > 0 ? (
            <ProductGrid products={storeProducts} />
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 border-dashed">
              <p className="text-neutral-500 font-medium">No products listed yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
