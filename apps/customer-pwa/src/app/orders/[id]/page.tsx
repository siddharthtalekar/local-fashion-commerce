'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ChevronLeft, CheckCircle2, Truck, Clock, MapPin, ReceiptText } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  product: {
    title: string;
    images: { url: string }[];
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  store: {
    name: string;
    address: string;
  };
  address: {
    title: string;
    line1: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
}

const timelineSteps = [
  { id: 'pending', label: 'Order Placed', desc: 'We have received your order', icon: ReceiptText },
  { id: 'confirmed', label: 'Confirmed', desc: 'Seller has confirmed your order', icon: CheckCircle2 },
  { id: 'shipped', label: 'Shipped', desc: 'Your item is on the way', icon: Truck },
  { id: 'delivered', label: 'Delivered', desc: 'Order has been delivered', icon: MapPin },
];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = useAuthStore(s => s.token);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }

    // Since we don't have a GET /orders/:id in the backend easily accessible without writing it,
    // we'll fetch all and filter for the MVP.
    apiFetch<Order[]>('/orders', { token })
      .then(data => {
        const found = data.find(o => o.id === id);
        setOrder(found || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch order:', err);
        setLoading(false);
      });
  }, [token, id]);

  if (loading) {
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <Package size={48} className="text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-stone-500 mb-6">We couldn't find the order you're looking for.</p>
        <button onClick={() => router.back()} className="bg-stone-900 text-white font-bold py-3 px-8 rounded-full">
          Go Back
        </button>
      </div>
    );
  }

  const currentStepIndex = timelineSteps.findIndex(s => s.id === order.status.toLowerCase());
  // Fallback to 0 if status is unknown
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 active:bg-stone-200 transition">
          <ChevronLeft size={24} className="text-stone-700" />
        </button>
        <h1 className="text-lg font-bold text-stone-900 flex-1">Order Details</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 mt-2">
        
        {/* Order Info Summary */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Order ID</p>
              <p className="text-sm font-bold text-stone-900">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Date</p>
              <p className="text-sm font-bold text-stone-900">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
            <p className="text-stone-500 font-medium text-sm">Total Amount</p>
            <p className="text-lg font-black text-stone-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
          <h2 className="font-bold text-stone-900 mb-6 uppercase tracking-widest text-sm">Tracking Status</h2>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:w-0.5 before:-translate-x-px before:bg-stone-100 md:before:mx-auto md:before:translate-x-0">
            {timelineSteps.map((step, index) => {
              const isActive = index <= activeIndex;
              const isLast = index === timelineSteps.length - 1;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-11 h-11 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isActive ? 'bg-green-500 border-green-100 text-white' : 'bg-stone-100 border-white text-stone-400'}`}>
                    <Icon size={18} />
                  </div>
                  
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 md:group-odd:text-right md:group-even:text-left">
                    <div className="flex flex-col">
                      <h4 className={`font-bold text-sm ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>{step.label}</h4>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-stone-500' : 'text-stone-400'}`}>{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm space-y-4">
          <h2 className="font-bold text-stone-900 uppercase tracking-widest text-sm mb-4">Items Ordered</h2>
          {order.items.map(item => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                {item.product.images[0] ? (
                  <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-stone-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 text-sm truncate">{item.product.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {item.size && <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-medium text-stone-600">Size: {item.size}</span>}
                  {item.color && <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-medium text-stone-600">Color: {item.color}</span>}
                  <span className="text-[10px] font-medium text-stone-500">Qty: {item.quantity}</span>
                </div>
                <p className="font-bold text-stone-900 text-sm mt-2">₹{item.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Address & Store Info */}
        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-stone-900 uppercase tracking-widest text-xs text-stone-400 mb-2">Delivery Address</h2>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <p className="font-bold text-sm text-stone-900">{order.address?.title || 'Home'}</p>
              <p className="text-xs text-stone-600 mt-1">{order.address?.line1}</p>
              <p className="text-xs text-stone-600">{order.address?.city} - {order.address?.pincode}</p>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-stone-900 uppercase tracking-widest text-xs text-stone-400 mb-2 mt-4">Sold By</h2>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                {order.store.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm text-stone-900">{order.store.name}</p>
                <p className="text-xs text-stone-500 truncate max-w-[200px]">{order.store.address}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
