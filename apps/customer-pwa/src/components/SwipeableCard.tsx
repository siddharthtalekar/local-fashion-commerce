'use client';

import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import type { ProductSummaryDto } from '@local-fashion/shared-types';
import { Star } from 'lucide-react';

interface SwipeableCardProps {
  product: ProductSummaryDto;
  onSwipeLeft: (productId: string) => void;
  onSwipeRight: (productId: string) => void;
  active: boolean;
}

export function SwipeableCard({ product, onSwipeLeft, onSwipeRight, active }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const scale = active ? 1 : 0.95;
  const controls = useAnimation();

  // Opacity for the overlay texts
  const xOpacity = useTransform(x, [-100, -20], [1, 0]);
  const heartOpacity = useTransform(x, [20, 100], [0, 1]);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      await controls.start({ x: 300, opacity: 0, transition: { duration: 0.2 } });
      onSwipeRight(product.id);
    } else if (offset < -100 || velocity < -500) {
      await controls.start({ x: -300, opacity: 0, transition: { duration: 0.2 } });
      onSwipeLeft(product.id);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const displayPrice = product.discountedPrice ?? product.price;

  return (
    <motion.div
      className="absolute top-0 left-0 w-full h-[65vh] bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100 will-change-transform cursor-grab active:cursor-grabbing"
      style={{ x, opacity, rotate, scale, zIndex: active ? 10 : 1 }}
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
    >
      <div className="relative w-full h-full">
        {/* Main Image */}
        {product.images[0] ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full bg-stone-200 flex items-center justify-center pointer-events-none">
            <span className="text-stone-400">No Image</span>
          </div>
        )}

        {/* Gradient Overlay for Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Swipe Overlays */}
        <motion.div
          style={{ opacity: heartOpacity }}
          className="absolute top-10 left-10 border-4 border-emerald-400 text-emerald-400 font-black text-4xl px-4 py-2 rounded-lg rotate-[-15deg] pointer-events-none"
        >
          WISHLIST
        </motion.div>
        
        <motion.div
          style={{ opacity: xOpacity }}
          className="absolute top-10 right-10 border-4 border-rose-400 text-rose-400 font-black text-4xl px-4 py-2 rounded-lg rotate-[15deg] pointer-events-none"
        >
          PASS
        </motion.div>

        {/* Product Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-white/80 mb-1">{product.brand.name}</p>
              <h2 className="text-2xl font-bold leading-tight mb-2 text-white">{product.title}</h2>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">₹{displayPrice}</span>
                {product.discountedPrice && product.discountedPrice < product.price && (
                  <span className="text-sm line-through text-white/60">₹{product.price}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end shrink-0 gap-2">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-bold">
                4.5 <Star size={12} className="fill-white" />
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase text-white/90">
                {product.store.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
