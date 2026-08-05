import Link from 'next/link';
import { ArrowLeft, Compass, Search, Heart, Share2, MessageCircle, ShoppingBag } from 'lucide-react';

const STYLE_FEEDS = [
  {
    id: '1',
    title: 'Summer Essentials 2026',
    author: 'Vogue Curator',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&auto=format&fit=crop',
    likes: '12.4k',
    comments: '328',
    tags: ['Summer', 'Dresses', 'Floral']
  },
  {
    id: '2',
    title: 'Streetwear Fusion',
    author: 'Urban Styles',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80&auto=format&fit=crop',
    likes: '8.2k',
    comments: '142',
    tags: ['Streetwear', 'Sneakers', 'Oversized']
  },
  {
    id: '3',
    title: 'Ethnic Elegance',
    author: 'Desi Vibe',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&auto=format&fit=crop',
    likes: '15.1k',
    comments: '892',
    tags: ['Festive', 'Sarees', 'Jewelry']
  },
  {
    id: '4',
    title: 'Minimalist Wardrobe',
    author: 'Less is More',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80&auto=format&fit=crop',
    likes: '9.6k',
    comments: '201',
    tags: ['Basics', 'Monochrome']
  }
];

export default function DiscoverPage() {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col sm:relative sm:z-0 sm:min-h-screen sm:bg-stone-50">
      {/* Mobile TikTok-style Feed */}
      <div className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide bg-black sm:hidden">
        {STYLE_FEEDS.map((feed, i) => (
          <div key={feed.id} className="h-screen w-full snap-start relative flex flex-col justify-end">
            <img src={feed.image} alt={feed.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            
            {/* Header (only on first item for aesthetics) */}
            {i === 0 && (
              <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-center z-10">
                <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white press-effect">
                  <ArrowLeft size={20} />
                </Link>
                <div className="flex gap-4">
                  <span className="text-white font-bold text-lg drop-shadow-md border-b-2 border-white pb-1">For You</span>
                  <span className="text-white/60 font-bold text-lg drop-shadow-md">Following</span>
                </div>
                <Link href="/search" className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white press-effect">
                  <Search size={18} />
                </Link>
              </div>
            )}
            
            {/* Content & Actions */}
            <div className="relative z-10 p-4 pb-20 flex items-end justify-between">
              {/* Info */}
              <div className="flex-1 pr-12">
                <h3 className="text-white font-black text-lg mb-1 drop-shadow-md">@{feed.author}</h3>
                <p className="text-white/90 text-sm mb-3 drop-shadow-md line-clamp-2">{feed.title}</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {feed.tags.map(tag => (
                    <span key={tag} className="text-xs font-bold bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {/* Shop Button */}
                <button className="flex items-center gap-2 bg-[#FF3E6C] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-brand hover:bg-rose-600 transition press-effect">
                  <ShoppingBag size={16} />
                  Shop this look
                </button>
              </div>
              
              {/* Right Side Actions */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-[#FF3E6C] transition press-effect">
                    <Heart size={24} className="fill-current" />
                  </button>
                  <span className="text-white text-xs font-bold drop-shadow-md">{feed.likes}</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-white/80 transition press-effect">
                    <MessageCircle size={24} />
                  </button>
                  <span className="text-white text-xs font-bold drop-shadow-md">{feed.comments}</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:text-white/80 transition press-effect">
                    <Share2 size={24} />
                  </button>
                  <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view (kept grid-based) */}
      <div className="hidden sm:block">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-900 press-effect">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-black text-lg text-stone-900 tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-display), system-ui' }}>
              <Compass size={20} className="text-[#FF3E6C]" />
              Discover
            </h1>
          </div>
          <Link href="/search" className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-900 press-effect">
            <Search size={18} />
          </Link>
        </header>

        <div className="p-4 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {STYLE_FEEDS.map((feed, i) => (
              <div key={feed.id} className="animate-slide-up bg-white rounded-3xl overflow-hidden shadow-card" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <div className="relative h-[400px]">
                  <img src={feed.image} alt={feed.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex gap-2 mb-2">
                      {feed.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight mb-1" style={{ fontFamily: 'var(--font-display), system-ui' }}>{feed.title}</h2>
                    <p className="text-white/80 text-sm font-medium">Curated by {feed.author} • {feed.likes} likes</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
