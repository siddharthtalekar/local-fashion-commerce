'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import {
  Package, TrendingUp, ShoppingBag, IndianRupee,
  Clock, CheckCircle2, Truck, Plus, BarChart2,
  Tag, AlertTriangle, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface Analytics {
  totalProducts: number;
  customerIntents: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

function StatCard({
  label, value, sub, icon: Icon, colorClass, glowClass, index,
}: {
  label: string; value: string; sub?: string; icon: any; colorClass: string; glowClass: string; index: number;
}) {
  const [displayed, setDisplayed] = useState(0);
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));

  useEffect(() => {
    if (isNaN(numeric) || numeric === 0) return;
    let start = 0;
    const step = numeric / 30;
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) { setDisplayed(numeric); clearInterval(timer); }
      else setDisplayed(start);
    }, 30);
    return () => clearInterval(timer);
  }, [numeric]);

  const prefix = value.startsWith('₹') ? '₹' : '';
  const formatted = prefix === '₹'
    ? `₹${Math.round(displayed).toLocaleString('en-IN')}`
    : Math.round(displayed).toLocaleString('en-IN');

  return (
    <div className={`bg-white rounded-3xl p-5 border border-stone-100 ${glowClass} animate-slide-up`}
      style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{label}</p>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colorClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-black text-[#282C3F] animate-count-up" style={{ fontFamily: 'var(--font-display)' }}>
        {formatted || value}
      </p>
      {sub && <p className="text-xs text-stone-400 font-medium mt-1">{sub}</p>}
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: 'Add Product',    href: '/products/new', icon: Plus,      color: 'bg-[#FF3E6C]/10 text-[#FF3E6C]' },
  { label: 'Manage Stock',   href: '/products',     icon: Package,   color: 'bg-blue-50 text-blue-600' },
  { label: 'Create Offer',   href: '/offers/new',   icon: Tag,       color: 'bg-amber-50 text-amber-600' },
  { label: 'View Analytics', href: '/analytics',    icon: BarChart2, color: 'bg-emerald-50 text-emerald-600' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const myStore = useStoreProfileStore((s) => s.myStore);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalProducts: 0, customerIntents: 0,
    totalOrders: 0, pendingOrders: 0, totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token || !myStore) return;

    Promise.allSettled([
      apiFetch<any>('/stores/mine/analytics', { token }),
      apiFetch<any[]>('/orders/retailer', { token }),
    ]).then(([analyticsRes, ordersRes]) => {
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (ordersRes.status === 'fulfilled') setRecentOrders(ordersRes.value.slice(0, 3));
      setLoaded(true);
    });
  }, [myStore]);

  const getStatusIcon = (status: string) => {
    if (status === 'pending')    return <Clock size={14} className="text-amber-500" />;
    if (status === 'confirmed')  return <CheckCircle2 size={14} className="text-blue-500" />;
    if (status === 'dispatched') return <Truck size={14} className="text-purple-500" />;
    if (status === 'delivered')  return <CheckCircle2 size={14} className="text-emerald-500" />;
    return <Clock size={14} className="text-stone-400" />;
  };

  const getStatusBg = (status: string) => {
    const map: Record<string, string> = {
      pending:    'bg-amber-50 text-amber-700',
      confirmed:  'bg-blue-50 text-blue-700',
      dispatched: 'bg-purple-50 text-purple-700',
      delivered:  'bg-emerald-50 text-emerald-700',
    };
    return map[status] ?? 'bg-stone-50 text-stone-700';
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-black text-[#282C3F]" style={{ fontFamily: 'var(--font-display)' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-stone-400 text-sm mt-1">Here&apos;s what&apos;s happening with <strong className="text-stone-600">{myStore?.name}</strong> today.</p>
      </div>

      {/* Pending verification banner */}
      {myStore?.verificationStatus !== 'approved' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-slide-up">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Store pending verification</p>
            <p className="text-xs text-amber-600 mt-0.5">Your store won&apos;t appear on the customer app until approved by our team. Usually takes 24h.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${analytics.totalRevenue}`} sub="Lifetime earnings" icon={IndianRupee} colorClass="bg-[#FF3E6C]/10 text-[#FF3E6C]" glowClass="stat-glow-brand" index={0} />
        <StatCard label="Total Orders"  value={`${analytics.totalOrders}`}   sub={`${analytics.pendingOrders} pending`} icon={ShoppingBag} colorClass="bg-blue-50 text-blue-600" glowClass="stat-glow-blue" index={1} />
        <StatCard label="Products"      value={`${analytics.totalProducts}`}  sub="In your catalog" icon={Package} colorClass="bg-emerald-50 text-emerald-600" glowClass="stat-glow-green" index={2} />
        <StatCard label="Customer Taps" value={`${analytics.customerIntents}`} sub="Profile views & intents" icon={TrendingUp} colorClass="bg-amber-50 text-amber-600" glowClass="stat-glow-amber" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-stone-100 p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-sm font-black text-[#282C3F] uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.href} href={a.href}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-sm transition-all press-effect group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform`}>
                  <a.icon size={18} />
                </div>
                <span className="text-xs font-bold text-[#282C3F] text-center leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-100 p-6 animate-slide-up" style={{ animationDelay: '260ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#282C3F] uppercase tracking-widest">Recent Orders</h2>
            <Link href="/orders" className="text-xs font-bold text-[#FF3E6C] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!loaded ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShoppingBag size={32} className="text-stone-200 mb-3" />
              <p className="text-sm font-bold text-stone-400">No orders yet</p>
              <p className="text-xs text-stone-300 mt-1">Orders will appear here once customers purchase</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-stone-700 text-sm flex-shrink-0">
                    {order.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#282C3F] truncate">{order.user?.name}</p>
                    <p className="text-xs text-stone-400 font-medium">
                      #{order.id.slice(-6).toUpperCase()} · {order.items?.length} item(s)
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-[#282C3F]">₹{order.totalAmount}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize mt-0.5 ${getStatusBg(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
