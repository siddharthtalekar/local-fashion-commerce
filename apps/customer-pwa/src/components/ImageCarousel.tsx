'use client';

import { useState, useRef, useEffect } from 'react';
import { Images } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  altPrefix: string;
}

export function ImageCarousel({ images, altPrefix }: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  return (
    <div className="relative">
      {/* Image count badge */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <Images size={12} />
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Gallery — horizontal scroll snap */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-2 lg:gap-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((url, i) => (
          <div
            key={i}
            className="w-full snap-center lg:min-w-0 flex-shrink-0 relative aspect-[4/5] bg-stone-100"
          >
            <img
              src={url}
              alt={`${altPrefix} — image ${i + 1}`}
              className="absolute inset-0 h-full w-full object-cover lg:rounded-xl"
            />
            {/* Gradient at bottom for desktop */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent lg:hidden pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-20 lg:hidden">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex 
                  ? 'w-4 bg-white shadow-sm' 
                  : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
