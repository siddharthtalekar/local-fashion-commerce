'use client';

export function ProductCardSkeleton() {
  return (
    <div className="w-full animate-fade-in">
      <div className="skeleton aspect-[3/4] w-full rounded-2xl mb-3" />
      <div className="px-1 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="flex gap-2 mt-1">
          <div className="skeleton h-4 w-14 rounded" />
          <div className="skeleton h-4 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StoreSkeleton() {
  return (
    <div className="w-64 shrink-0 animate-fade-in">
      <div className="skeleton h-36 w-full rounded-2xl mb-3" />
      <div className="space-y-2 px-1">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 min-w-[80px]">
      <div className="skeleton h-20 w-20 rounded-full" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm animate-fade-in">
      <div className="p-4 border-b border-stone-100 flex justify-between">
        <div className="space-y-2">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-md" />
      </div>
      <div className="p-4 flex gap-4">
        <div className="skeleton w-16 h-20 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-4 w-24 rounded mt-2" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="skeleton w-full h-[420px] md:h-[520px] rounded-3xl" />
  );
}

export function ProfileMenuSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-stone-50 last:border-0">
          <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-48 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InlineLoader({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-brand-500"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
