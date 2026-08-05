'use client';

import { useEffect, useState } from 'react';
import { Package, CheckCircle2, Truck, Clock, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { OrderSkeleton } from '@/components/Skeleton';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  product: { title: string; images: { url: string }[] };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  store: { name: string };
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string; border: string }> = {
  pending: {
    icon: <Clock size={14} />,
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  confirmed: {
    icon: <CheckCircle2 size={14} />,
    label: 'Confirmed',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  shipped: {
    icon: <Truck size={14} />,
    label: 'Shipped',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  delivered: {
    icon: <CheckCircle2 size={14} />,
    label: 'Delivered',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  cancelled: {
    icon: <XCircle size={14} />,
    label: 'Cancelled',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
};

const FILTER_TABS = ['All', 'Active', 'Delivered', 'Cancelled'];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.pending;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </div>
  );
}

// Delivery timeline
const TIMELINE_STEPS = ['confirmed', 'shipped', 'delivered'];
function OrderTimeline({ status }: { status: string }) {
  const currentIdx = TIMELINE_STEPS.indexOf(status.toLowerCase());
  if (status.toLowerCase() === 'cancelled') return null;
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-myntra-pink' : 'bg-stone-100 border-2 border-stone-200'}`}>
                {done && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 h-0.5 last:hidden mx-1">
                <div className={`h-full rounded-full transition-all ${i < currentIdx ? 'bg-myntra-pink' : 'bg-stone-100'}`} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        {TIMELINE_STEPS.map((step, i) => (
          <span key={step} className={`text-[9px] font-bold uppercase tracking-wider ${i <= currentIdx ? 'text-myntra-pink' : 'text-stone-400'}`}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setLoginModalOpen = useAuthStore((s) => s.setLoginModalOpen);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiFetch<Order[]>('/orders', { token })
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[72vh] text-center px-6 animate-scale-in">
        <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <Package size={52} className="text-blue-200" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black text-stone-900 mb-2">Your Orders</h2>
        <p className="text-stone-500 text-sm max-w-[240px] mb-8 leading-relaxed">Log in to track your past orders and purchases.</p>
        <button onClick={() => setLoginModalOpen(true)} className="rounded-2xl bg-gradient-to-r from-myntra-pink to-rose-600 px-10 py-3.5 text-sm font-black text-white shadow-brand press-effect">
          LOG IN
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return !['delivered', 'cancelled'].includes(o.status.toLowerCase());
    if (activeTab === 'Delivered') return o.status.toLowerCase() === 'delivered';
    if (activeTab === 'Cancelled') return o.status.toLowerCase() === 'cancelled';
    return true;
  });

  return (
    <div className="pb-28 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition">
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
        <div>
          <h1 className="text-xl font-black text-stone-900">My Orders</h1>
          <p className="text-xs text-stone-500 font-medium">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-stone-900 text-white shadow-card' : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-stone-100 shadow-card animate-scale-in">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-5">
            <Package size={36} className="text-stone-300" />
          </div>
          <h2 className="text-xl font-black text-stone-900 mb-2">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} orders yet</h2>
          <p className="text-stone-500 text-sm mb-6">Your orders will appear here once you place them.</p>
          <Link href="/" className="rounded-2xl bg-gradient-to-r from-myntra-pink to-rose-600 px-8 py-3 text-sm font-black text-white shadow-brand press-effect">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3 max-w-lg mx-auto md:max-w-full">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-stone-100 shadow-card overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-stone-50">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">From</p>
                  <p className="font-black text-stone-900 text-sm">{order.store.name}</p>
                  <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Items */}
              <div className="px-4 py-3 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-18 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-100">
                      {item.product.images[0] ? (
                        <img src={item.product.images[0].url} alt={item.product.title} className="w-full h-full object-cover" style={{ height: 72 }} />
                      ) : (
                        <div className="w-full h-18 flex items-center justify-center"><Package size={16} className="text-stone-300" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-sm truncate">{item.product.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.size && <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded-lg font-bold text-stone-600">Size: {item.size}</span>}
                        <span className="text-[10px] font-medium text-stone-400">Qty: {item.quantity}</span>
                      </div>
                      <p className="font-black text-stone-900 text-sm mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <OrderTimeline status={order.status} />

              {/* Footer */}
              <div className="px-4 py-3 border-t border-stone-50 bg-stone-50/50 flex justify-between items-center">
                <p className="text-xs text-stone-400 font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Paid</p>
                  <p className="font-black text-stone-900 text-base">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
