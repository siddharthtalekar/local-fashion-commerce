'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { apiFetch } from '@/lib/api';
import {
  Users, Store, Package, ShoppingBag, Clock, TrendingUp,
  CheckCircle, AlertTriangle, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface AdminAnalytics {
  totalUsers: number;
  totalRetailers: number;
  approvedStores: number;
  pendingStores: number;
  totalProducts: number;
  totalOrders: number;
}

function StatCard({
  label, value, sub, subLabel, icon: Icon, color, href, delay = 0,
}: {
  label: string; value: number; sub?: number; subLabel?: string;
  icon: any; color: string; href?: string; delay?: number;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.ceil(value / 25);
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplayed(start);
      if (start >= value) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  const content = (
    <div className={`stat-card animate-slide-up stagger-${delay + 1}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {href && <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />}
      </div>
      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-4xl font-black text-white tabular-nums">{displayed.toLocaleString()}</p>
      {sub !== undefined && subLabel && (
        <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color }}>{sub}</span> {subLabel}
        </p>
      )}
    </div>
  );

  return href ? <Link href={href} className="block no-underline">{content}</Link> : content;
}

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<AdminAnalytics>('/admin/analytics', { token })
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle size={40} className="text-amber-400 mb-4" />
        <p className="text-white font-bold text-lg">Could not load analytics</p>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-2">Check that the API is running and your session is valid.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--brand)' }}>Good day, {user?.name?.split(' ')[0]} 👋</p>
        <h1 className="text-3xl font-black text-white tracking-tight">Platform Overview</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Live statistics across the entire LocalFashion network.
        </p>
      </div>

      {/* Alert banner if pending stores */}
      {analytics.pendingStores > 0 && (
        <Link href="/stores/pending"
          className="flex items-center justify-between gap-4 p-4 rounded-2xl border animate-slide-up no-underline group"
          style={{ background: 'var(--warning-bg)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.2)' }}>
              <Clock size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-amber-300 text-sm">Action Required</p>
              <p className="text-xs text-amber-400/80">
                {analytics.pendingStores} store{analytics.pendingStores !== 1 ? 's' : ''} awaiting approval to go live
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 group-hover:gap-3 transition-all">
            Review <ArrowRight size={14} />
          </div>
        </Link>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <StatCard label="Customers" value={analytics.totalUsers}
          icon={Users} color="#3B82F6" href="/users" delay={0} />
        <StatCard label="Retailers" value={analytics.totalRetailers}
          icon={TrendingUp} color="#8B5CF6" href="/users" delay={1} />
        <StatCard label="Live Stores" value={analytics.approvedStores}
          sub={analytics.pendingStores} subLabel="pending approval"
          icon={CheckCircle} color="#10B981" href="/stores/active" delay={2} />
        <StatCard label="Pending Approvals" value={analytics.pendingStores}
          icon={Clock} color="#F59E0B" href="/stores/pending" delay={3} />
        <StatCard label="Total Products" value={analytics.totalProducts}
          icon={Package} color="#FF3E6C" href="/products" delay={4} />
        <StatCard label="Total Orders" value={analytics.totalOrders}
          icon={ShoppingBag} color="#06B6D4" href="/orders" delay={5} />
      </div>

      {/* Quick Actions */}
      <div className="admin-card p-5 animate-slide-up stagger-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Review Approvals', href: '/stores/pending', color: '#F59E0B' },
            { label: 'Manage Stores', href: '/stores/active', color: '#10B981' },
            { label: 'View All Orders', href: '/orders', color: '#06B6D4' },
            { label: 'Add Category', href: '/categories', color: '#FF3E6C' },
            { label: 'Add Brand', href: '/brands', color: '#8B5CF6' },
          ].map(({ label, href, color }) => (
            <Link key={href} href={href}
              className="btn btn-ghost text-xs press-effect"
              style={{ borderColor: `${color}30`, color }}>
              {label} <ArrowRight size={12} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
