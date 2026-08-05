'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useOrderStore } from '@/store/order';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/Toast';

interface Address {
  id: string;
  title: string;
  line1: string;
  line2?: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const cart = useCartStore((s) => s.cart);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoadingAddresses(false);
      return;
    }
    apiFetch<Address[]>('/addresses', { token })
      .then(data => {
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        setLoadingAddresses(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingAddresses(false);
      });
  }, [token]);

  // If cart is empty, redirect back
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <button onClick={() => router.push('/')} className="mt-4 text-myntra-pink font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  const totalMRP = cart.items.reduce((acc, item) => acc + ((item.product?.price ?? 0) * item.quantity), 0);
  const totalDiscount = cart.items.reduce((acc, item) => acc + (((item.product?.price ?? 0) - (item.product?.discountedPrice || item.product?.price || 0)) * item.quantity), 0);
  const totalAmount = totalMRP - totalDiscount;

  const { isProcessing, placeOrder } = useOrderStore();

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast('Please select a delivery address', 'error');
      return;
    }
    const success = await placeOrder(selectedAddressId, paymentMethod);
    
    if (success) {
      router.push('/checkout/success');
    } else {
      toast('Failed to place order. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Checkout</h1>
      </div>

      <div className="mx-auto max-w-4xl p-4 md:flex md:gap-8 md:p-8">
        <div className="flex-1 space-y-6">
          
          {/* Delivery Address */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-[#FF3E6C]" />
              <h2 className="font-black text-stone-900" style={{ fontFamily: 'var(--font-display), system-ui' }}>Delivery Address</h2>
            </div>
            
            {loadingAddresses ? (
              <div className="space-y-3">
                <div className="h-20 skeleton rounded-2xl w-full" />
                <div className="h-20 skeleton rounded-2xl w-full" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-stone-500 text-sm mb-4">You have no saved addresses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#FF3E6C] bg-rose-50/50 shadow-sm' : 'border-stone-200 hover:bg-stone-50'}`}>
                    <input 
                      type="radio" 
                      name="address" 
                      checked={selectedAddressId === addr.id} 
                      onChange={() => setSelectedAddressId(addr.id)} 
                      className="accent-[#FF3E6C] w-4 h-4 mt-1" 
                    />
                    <div className="flex-1">
                      <p className="font-bold text-stone-900">{addr.title}</p>
                      <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => router.push('/addresses/new')}
              className="w-full mt-4 py-3 text-sm font-bold text-[#FF3E6C] border border-stone-200 rounded-2xl hover:bg-rose-50 transition press-effect"
            >
              + ADD NEW ADDRESS
            </button>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-[#FF3E6C]" />
              <h2 className="font-black text-stone-900" style={{ fontFamily: 'var(--font-display), system-ui' }}>Payment Options</h2>
            </div>
            
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-[#FF3E6C] bg-rose-50/50 shadow-sm' : 'border-stone-200 hover:bg-stone-50'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="accent-[#FF3E6C] w-4 h-4" />
                <div className="flex-1">
                  <p className="font-bold text-stone-900">UPI (GPay, PhonePe, etc.)</p>
                  <p className="text-xs text-stone-500 mt-1">Pay instantly using any UPI app</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#FF3E6C] bg-rose-50/50 shadow-sm' : 'border-stone-200 hover:bg-stone-50'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-[#FF3E6C] w-4 h-4" />
                <div className="flex-1">
                  <p className="font-bold text-stone-900">Cash on Delivery</p>
                  <p className="text-xs text-stone-500 mt-1">Pay at your doorstep</p>
                </div>
                <Banknote size={24} className="text-stone-400" />
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-6 md:mt-0 md:w-[350px] md:shrink-0">
          <div className="rounded-3xl border border-stone-100 bg-white p-5 shadow-card sticky top-24">
            <h3 className="mb-4 text-xs font-black text-stone-500 uppercase tracking-wider">
              Price Details ({cart.items.length} Items)
            </h3>
            
            <div className="space-y-3 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span>₹{totalMRP}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount on MRP</span>
                <span className="text-emerald-500">-₹{totalDiscount}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-emerald-500">FREE</span>
              </div>
              
              <hr className="my-4 border-stone-200" />
              
              <div className="flex justify-between font-bold text-stone-900 text-base">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full rounded-2xl bg-gradient-to-r from-[#FF3E6C] to-rose-600 py-4 text-sm font-black tracking-wide text-white shadow-brand transition-all hover:shadow-brand-lg press-effect disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isProcessing ? 'PROCESSING...' : `PAY ₹${totalAmount}`}
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-stone-400 font-semibold uppercase">
              <ShieldCheck size={14} className="text-emerald-500" />
              100% Secure Payments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
