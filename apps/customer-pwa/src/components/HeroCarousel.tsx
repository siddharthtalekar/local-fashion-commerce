'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
    tag: '🔥 End of Season Sale',
    tagColor: 'from-[#FF3E6C] to-[#FF6B35]',
    title: 'ETHNIC',
    titleAccent: 'ELEGANCE',
    subtitle: 'Discover stunning kurtas, sarees & ethnic wear from boutiques near you.',
    link: '/search?q=ethnic',
    cta: 'Shop Ethnic',
    cta2: 'Explore Looks',
    cta2Link: '/discover',
    overlay: 'from-black/85 via-black/40 to-transparent',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
    tag: '⚡ New Drops',
    tagColor: 'from-amber-400 to-orange-500',
    title: 'STREET',
    titleAccent: 'CULTURE',
    subtitle: 'Fresh streetwear and contemporary styles dropped this week.',
    link: '/search?q=streetwear',
    cta: 'Shop Streetwear',
    cta2: 'View Stores',
    cta2Link: '/stores',
    overlay: 'from-black/80 via-black/35 to-transparent',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop',
    tag: '✨ Trending Now',
    tagColor: 'from-purple-500 to-pink-500',
    title: 'WESTERN',
    titleAccent: 'WONDERS',
    subtitle: 'Bold western silhouettes & contemporary cuts from local designers.',
    link: '/search?q=western',
    cta: 'Explore Western',
    cta2: 'Flash Deals',
    cta2Link: '/search',
    overlay: 'from-black/80 via-black/30 to-transparent',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=2070&auto=format&fit=crop',
    tag: '💎 Premium',
    tagColor: 'from-[#F59E0B] to-[#EF4444]',
    title: 'TIMELESS',
    titleAccent: 'CLASSICS',
    subtitle: 'Premium fashion & accessories from trusted local boutiques.',
    link: '/search?q=accessories',
    cta: 'Shop Premium',
    cta2: 'All Brands',
    cta2Link: '/search',
    overlay: 'from-black/85 via-black/45 to-transparent',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop',
    tag: '🏪 Local Boutiques',
    tagColor: 'from-emerald-500 to-teal-500',
    title: 'SHOP',
    titleAccent: 'LOCAL',
    subtitle: 'Support local fashion stores. Discover unique styles you won\'t find online.',
    link: '/stores',
    cta: 'Find Stores',
    cta2: 'Near Me',
    cta2Link: '/stores',
    overlay: 'from-black/80 via-black/35 to-transparent',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070&auto=format&fit=crop',
    tag: '👖 Denim Special',
    tagColor: 'from-blue-500 to-indigo-600',
    title: 'DENIM',
    titleAccent: 'FOREVER',
    subtitle: 'Jeans, jackets, dungarees — the best denim collection in the city.',
    link: '/search?q=denim',
    cta: 'Shop Denim',
    cta2: 'View All',
    cta2Link: '/search',
    overlay: 'from-black/80 via-black/40 to-transparent',
  },
];

const SLIDE_DURATION = 5000;

export function HeroCarousel({ citySlug }: { citySlug: string }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(index);
      setProgress(0);
      setTimeout(() => setIsAnimating(false), 700);
    },
    [isAnimating]
  );

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, goTo]
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
    }, 50);
    timerRef.current = setTimeout(() => {
      setCurrent((p) => (p + 1) % slides.length);
      setProgress(0);
    }, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [current]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 50 && dy < 50) {
      dx < 0 ? next() : prev();
    }
  };

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden rounded-3xl bg-stone-900 shadow-lg"
      style={{ height: 'clamp(380px, 60vw, 540px)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={s.image}
            alt={s.title}
            className={`w-full h-full object-cover object-top ${
              idx === current ? 'animate-ken-burns' : ''
            }`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${s.overlay}`} />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-12">
        <div key={current} className="stagger-children">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 mb-3 animate-slide-up">
            <span
              className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${slide.tagColor} text-white text-[10px] font-black uppercase tracking-widest shadow-lg`}
            >
              {slide.tag}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-5xl sm:text-6xl font-black text-white leading-[0.95] tracking-tighter mb-3 animate-slide-up"
            style={{ fontFamily: 'var(--font-display), system-ui' }}
          >
            {slide.title}
            <br />
            <span className="gradient-text">{slide.titleAccent}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-stone-300 text-sm font-medium mb-5 max-w-[280px] leading-relaxed animate-slide-up">
            {slide.subtitle}
          </p>

          {/* Dual CTA */}
          <div className="flex items-center gap-3 animate-slide-up">
            <Link
              href={slide.link}
              className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full text-sm font-black uppercase tracking-wide shadow-lg press-effect"
            >
              {slide.cta}
              <ArrowRight size={14} />
            </Link>
            <Link
              href={slide.cta2Link}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-5 py-3 rounded-full text-sm font-bold uppercase tracking-wide press-effect"
            >
              {slide.cta2}
            </Link>
          </div>
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 z-30 bg-black/30 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
        {current + 1} / {slides.length}
      </div>

      {/* Progress bars */}
      <div className="absolute bottom-5 left-6 right-6 z-30 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className="relative h-[3px] flex-1 rounded-full bg-white/30 overflow-hidden"
          >
            {idx === current && (
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full"
                style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
              />
            )}
            {idx < current && <div className="absolute inset-0 bg-white rounded-full" />}
          </button>
        ))}
      </div>

      {/* Desktop nav arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 transition press-effect"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 transition press-effect"
      >
        <ChevronRight size={20} />
      </button>
    </section>
  );
}
