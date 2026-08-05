'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_URL, PILOT_CITY_SLUG } from '@/lib/api';

// Fashion fallback images from Unsplash for stores without images
const STORE_FASHION_IMAGES = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&q=80&auto=format&fit=crop',
];

interface StorySkeleton {
  id: string;
  name: string;
  image?: string;
}

interface StoriesBarProps {
  stores?: StorySkeleton[];
}

function StoryRing({
  store,
  index,
  seen,
}: {
  store: StorySkeleton;
  index: number;
  seen: boolean;
}) {
  const fallbackImg = STORE_FASHION_IMAGES[index % STORE_FASHION_IMAGES.length];
  const imgUrl = store.image || fallbackImg;

  return (
    <Link
      href={`/stores/${store.id}`}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 group animate-scale-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Ring */}
      <div className={seen ? 'story-ring-seen' : 'story-ring'} style={{ padding: 2, borderRadius: '50%' }}>
        <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-white bg-stone-100">
          <img
            src={imgUrl}
            alt={store.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      {/* Name */}
      <span className="text-[10px] font-bold text-stone-600 text-center max-w-[68px] line-clamp-1 group-hover:text-[#FF3E6C] transition-colors">
        {store.name}
      </span>
    </Link>
  );
}

export function StoriesBar({ stores }: StoriesBarProps) {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [storeList, setStoreList] = useState<StorySkeleton[]>(stores ?? []);

  // Fetch stores if not passed as props
  useEffect(() => {
    if (!stores || stores.length === 0) {
      fetch(`${API_URL}/stores?citySlug=${PILOT_CITY_SLUG}&limit=12`)
        .then((r) => r.json())
        .then((data: any[]) => {
          if (Array.isArray(data)) {
            setStoreList(
              data.map((s) => ({
                id: s.id,
                name: s.name,
                image: s.coverImage ?? s.imageUrl ?? undefined,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [stores]);

  // Load seen IDs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lf_seen_stories');
      if (raw) setSeenIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const handleSee = (id: string) => {
    setSeenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem('lf_seen_stories', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  if (storeList.length === 0) {
    // Skeleton
    return (
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-[64px] h-[64px] rounded-full skeleton" />
            <div className="w-12 h-2.5 rounded skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide stagger-children">
      {/* "Your City" story at front */}
      <Link
        href="/stores"
        className="flex flex-col items-center gap-1.5 flex-shrink-0 group animate-scale-in"
      >
        <div
          className="w-[64px] h-[64px] rounded-full flex items-center justify-center shadow-brand"
          style={{
            background: 'linear-gradient(135deg, #FF3E6C 0%, #FF905A 100%)',
          }}
        >
          <span className="text-white text-2xl">🏙️</span>
        </div>
        <span className="text-[10px] font-black text-[#FF3E6C] uppercase tracking-wide">
          All Shops
        </span>
      </Link>

      {storeList.map((store, i) => (
        <div key={store.id} onClick={() => handleSee(store.id)}>
          <StoryRing store={store} index={i} seen={seenIds.has(store.id)} />
        </div>
      ))}
    </div>
  );
}
