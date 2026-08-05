import type { StoreSummaryDto } from '@local-fashion/shared-types';

export interface StoreCardProps {
  store: StoreSummaryDto;
  href?: string;
}

export function StoreCard({ store, href }: StoreCardProps) {
  const content = (
    <>
      <div className="aspect-[16/9] overflow-hidden rounded-t-xl bg-stone-100">
        {store.coverImageUrl ? (
          <img
            src={store.coverImageUrl}
            alt={store.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-900">{store.name}</h3>
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">{store.address}</p>
        {store.distanceKm != null && (
          <p className="mt-2 text-xs text-rose-600">{store.distanceKm.toFixed(1)} km away</p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      {content}
    </article>
  );
}
