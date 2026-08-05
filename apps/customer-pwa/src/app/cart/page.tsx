'use client';

import { useCartStore } from '@/store/cart';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Tag, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from '@/components/Toast';
import { useWishlistStore } from '@/store/wishlist';

export default function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, amount: number} | null>(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6 animate-scale-in">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center">
            <ShoppingBag size={52} className="text-rose-200" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xl">
            😢
          </div>
        </div>
        <h2 className="text-2xl font-black text-stone-900 mb-2">Your bag is empty</h2>
        <p className="text-stone-500 text-sm max-w-[240px] leading-relaxed mb-8">
          Looks like you haven't added anything yet. Let's find something you'll love!
        </p>
        <Link
          href="/search"
          className="rounded-2xl bg-gradient-to-r from-myntra-pink to-rose-600 px-10 py-3.5 text-sm font-black text-white shadow-brand hover:shadow-brand-lg transition-all press-effect"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const totalMRP = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalDiscount = cart.items.reduce(
    (acc, item) =>
      acc + (item.product.price - (item.product.discountedPrice || item.product.price)) * item.quantity,
    0
  );
  const totalAmount = totalMRP - totalDiscount;

  const handleRemove = async (id: string, name: string) => {
    setRemovingId(id);
    await removeFromCart(id);
    setRemovingId(null);
    toast(`Removed from bag`, 'info');
  };

  const handleMoveToWishlist = async (id: string, productId: string) => {
    setRemovingId(id);
    const { useAuthStore } = await import('@/store/auth');
    const token = useAuthStore.getState().token;
    if (token) {
      toggleWishlist(productId, token);
      await removeFromCart(id);
      toast(`Moved to Wishlist`, 'success');
    } else {
      useAuthStore.getState().setLoginModalOpen(true);
    }
    setRemovingId(null);
  };

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    if (coupon.toUpperCase() === 'WELCOME10') {
      const discount = Math.min(totalAmount * 0.1, 500); // 10% off up to ₹500
      setAppliedCoupon({ code: 'WELCOME10', amount: discount });
      setCouponError('');
      toast('Coupon applied successfully! 🎉', 'success');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const finalAmount = totalAmount - (appliedCoupon?.amount || 0);

  return (
    <div className="max-w-4xl mx-auto pt-2 pb-40 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition">
          <ArrowLeft size={20} className="text-stone-600" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-stone-900">My Bag</h1>
          <p className="text-xs text-stone-500 font-medium">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      {/* Checkout Progress Bar */}
      <div className="flex items-center justify-between px-8 mb-8 relative md:hidden animate-slide-down">
        <div className="absolute top-3 left-8 right-8 h-[2px] bg-stone-200 -z-10" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black shadow-sm ring-4 ring-[#FAFAF9]">1</div>
          <span className="text-[9px] font-black uppercase text-stone-900 tracking-wider">Bag</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-[10px] font-black ring-4 ring-[#FAFAF9]">2</div>
          <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Address</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-[10px] font-black ring-4 ring-[#FAFAF9]">3</div>
          <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Payment</span>
        </div>
      </div>

      <div className="md:flex md:gap-6">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border border-stone-100 shadow-card overflow-hidden transition-all ${removingId === item.id ? 'opacity-50 scale-95' : ''}`}
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                <Link href={`/products/${item.product?.slug || item.productId}`} className="relative h-28 w-20 shrink-0 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-stone-900 text-sm uppercase truncate leading-tight">
                        {item.product.title}
                      </p>
                      {item.product.store && (
                        <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                          by <span className="text-myntra-pink font-bold">{item.product.store.name}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.id, item.product.title)}
                      className="p-1.5 text-stone-300 hover:text-rose-500 transition-colors flex-shrink-0 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Attributes */}
                  <div className="flex items-center gap-2 mt-2">
                    {item.size && (
                        <span className="inline-flex items-center text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                          Size: {item.size}
                        </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-black text-stone-900 text-base">
                      ₹{((item.product.discountedPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                    {item.product.discountedPrice && item.product.discountedPrice < item.product.price && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {Math.round(((item.product.price - item.product.discountedPrice) / item.product.price) * 100)}% off
                      </span>
                    )}
                  </div>

                  {/* Actions (Qty + Wishlist) */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 transition disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                      <span className="px-3 text-sm font-black text-stone-900 min-w-[32px] text-center bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 transition"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleMoveToWishlist(item.id, item.product.id)}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase text-stone-500 hover:text-myntra-pink transition-colors px-2 py-1.5 rounded-lg hover:bg-rose-50"
                    >
                      <Heart size={14} />
                      Move to Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary — sticky on desktop, fixed bar on mobile */}
        <div className="md:w-[320px] md:shrink-0">
          {/* Coupon */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-card p-4 mt-4 md:mt-0 mb-3">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-myntra-pink" />
              <h3 className="text-sm font-black text-stone-900">Have a coupon?</h3>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code (try WELCOME10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm font-bold uppercase tracking-wider outline-none focus:border-myntra-pink focus:ring-1 focus:ring-myntra-pink/20 disabled:bg-stone-50 disabled:text-stone-400"
                />
                {!appliedCoupon ? (
                  <button
                    onClick={handleApplyCoupon}
                    className="rounded-xl bg-stone-900 text-white px-4 py-2 text-xs font-black hover:bg-black transition"
                  >
                    APPLY
                  </button>
                ) : (
                  <button
                    onClick={() => { setAppliedCoupon(null); setCoupon(''); }}
                    className="rounded-xl border border-stone-200 text-stone-500 px-4 py-2 text-xs font-black hover:bg-stone-50 transition"
                  >
                    REMOVE
                  </button>
                )}
              </div>
              {couponError && <p className="text-xs font-bold text-rose-500 ml-1">{couponError}</p>}
              {appliedCoupon && <p className="text-xs font-bold text-emerald-600 ml-1 flex items-center gap-1"><Tag size={10} /> Saved ₹{appliedCoupon.amount.toLocaleString('en-IN')}</p>}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-card p-5 sticky top-24">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-4 border-b border-stone-100 pb-3">
              Price Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Total MRP ({cart.items.length} items)</span>
                <span className="font-semibold text-stone-900">₹{totalMRP.toLocaleString('en-IN')}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount on MRP</span>
                  <span>− ₹{totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span>Platform Fee</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold animate-slide-down">
                  <span>Coupon Discount</span>
                  <span>− ₹{appliedCoupon.amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-stone-100 pt-3 flex justify-between font-black text-stone-900 text-base">
                <span>Total Amount</span>
                <span>₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
              {(totalDiscount > 0 || appliedCoupon) && (
                <div className="relative mt-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 shadow-inner overflow-hidden animate-scale-in">
                  <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-200/40 rounded-full blur-md" />
                  <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-teal-200/40 rounded-full blur-md" />
                  <p className="text-emerald-700 text-sm font-black text-center relative z-10 flex items-center justify-center gap-1.5">
                    🎉 You save ₹{(totalDiscount + (appliedCoupon?.amount || 0)).toLocaleString('en-IN')} on this order!
                  </p>
                </div>
              )}
            </div>
            <Link
              href="/checkout"
              className="mt-5 flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-myntra-pink to-rose-600 py-3.5 text-sm font-black text-white shadow-brand hover:shadow-brand-lg transition-all press-effect"
            >
              PLACE ORDER
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
