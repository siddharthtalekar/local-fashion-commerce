'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import {
  Package, Heart, MapPin, ChevronRight, LogOut, Settings,
  UserCircle, HelpCircle, Bell, Wallet, Tag, Sparkles, ShoppingBag,
  Crown, Moon
} from 'lucide-react';
import Link from 'next/link';
import { InstallPWA } from '@/components/InstallPWA';
import { useHydration } from '@/hooks/useHydration';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { toast } from '@/components/Toast';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setLoginModalOpen = useAuthStore((s) => s.setLoginModalOpen);
  const isHydrated = useHydration();
  const wishlistCount = useWishlistStore((s) => s.wishlistIds.length);
  const cartCount = useCartStore((s) => s.cart?.items?.reduce((t, i) => t + i.quantity, 0) || 0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isHydrated) return null;

  if (!user) {
    return (
      <div className="flex min-h-[82vh] flex-col items-center justify-center p-6 text-center animate-scale-in">
        <div className="relative mb-8">
          <div className="absolute -inset-6 rounded-full bg-rose-100/40 blur-2xl" />
          <div className="relative w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-card border border-stone-100">
            <UserCircle size={60} className="text-stone-200" strokeWidth={1} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Your Fashion Profile</h2>
        <p className="mt-3 text-stone-500 max-w-[260px] leading-relaxed text-sm">
          Log in to track orders, save your favourite styles, and get personalised recommendations.
        </p>
        <button
          onClick={() => setLoginModalOpen(true)}
          className="mt-8 w-full max-w-[280px] rounded-2xl bg-gradient-to-r from-myntra-pink to-rose-600 px-8 py-4 text-sm font-black tracking-wider text-white shadow-brand hover:shadow-brand-lg transition-all press-effect"
        >
          LOG IN / SIGN UP
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast('You have been logged out.', 'info');
    setShowLogoutConfirm(false);
  };

  const menuGroups = [
    {
      title: 'Shopping',
      items: [
        { label: 'My Orders', sub: 'Track your deliveries', href: '/orders', icon: Package, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'My Wishlist', sub: `${wishlistCount} saved items`, href: '/wishlist', icon: Heart, iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
        { label: 'My Bag', sub: `${cartCount} item${cartCount !== 1 ? 's' : ''} in bag`, href: '/cart', icon: ShoppingBag, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Addresses', sub: 'Manage delivery locations', href: '/addresses', icon: MapPin, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { label: 'My Wallet', sub: 'Check balance & history', href: '/wallet', icon: Wallet, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
      ],
    },
    {
      title: 'Offers & Rewards',
      items: [
        { label: 'Rewards & Scratch Cards', sub: 'Unlock discounts and offers', href: '/rewards', icon: Sparkles, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
        { label: 'Coupons & Offers', sub: 'View your active discounts', href: '/offers', icon: Tag, iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
      ],
    },
    {
      title: 'Support & Settings',
      items: [
        { label: 'Appearance', sub: 'Dark mode (Coming soon)', href: '#', icon: Moon, iconBg: 'bg-stone-800', iconColor: 'text-stone-300' },
        { label: 'Notifications', sub: 'Manage alerts & updates', href: '/notifications', icon: Bell, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { label: 'Help Center', sub: 'FAQs & Customer Support', href: '/support', icon: HelpCircle, iconBg: 'bg-stone-100', iconColor: 'text-stone-600' },
      ],
    },
  ];

  return (
    <div className="pb-28 animate-fade-in">
      {/* Profile Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6 mb-5 shadow-lg">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-myntra-pink/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

        {/* Header actions */}
        <div className="relative z-10 flex justify-end mb-4">
          <Link href="/profile/settings" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <Settings size={18} className="text-white/70" />
          </Link>
        </div>

        {/* Avatar + info */}
        <div className="relative z-10 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-myntra-pink to-rose-400 flex items-center justify-center font-black text-white text-3xl shadow-brand border-2 border-white/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-stone-900" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{user.name}</h1>
            <p className="text-stone-400 text-sm mt-0.5">{user.phone}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-stone-900 px-2.5 py-0.5 rounded-full shadow-sm">
                <Crown size={12} className="text-stone-900 fill-stone-900" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Gold Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
          {[
            { label: 'Orders', value: '—', href: '/orders' },
            { label: 'Wishlist', value: wishlistCount || '0', href: '/wishlist' },
            { label: 'In Bag', value: cartCount || '0', href: '/cart' },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="flex flex-col items-center group">
              <span className="text-xl font-black text-white group-hover:text-myntra-pink transition-colors">{stat.value}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{stat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Install PWA */}
      <InstallPWA />

      {/* Menu Groups */}
      <div className="space-y-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1 mb-2">{group.title}</p>
            <div className="bg-white rounded-3xl shadow-card border border-stone-100 overflow-hidden">
              {group.items.map((item, i) => {
                const isComingSoon = item.href === '#';
                const Wrapper = isComingSoon ? 'button' : Link;
                return (
                  <Wrapper
                    key={item.label}
                    href={item.href as any}
                    onClick={isComingSoon ? (e: any) => { e.preventDefault(); toast('Dark mode is coming soon!', 'info'); } : undefined}
                    className={`flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors press-effect w-full text-left ${i < group.items.length - 1 ? 'border-b border-stone-50' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={18} className={item.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-sm">{item.label}</p>
                      <p className="text-xs text-stone-400 font-medium mt-0.5">{item.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
                  </Wrapper>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-5">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white border border-stone-200 py-4 text-sm font-black text-rose-600 shadow-card hover:bg-rose-50 transition active:scale-[0.98]"
        >
          <LogOut size={18} />
          LOG OUT
        </button>
        <p className="text-center mt-4 text-xs font-semibold text-stone-300">LocalFashion v1.0.0</p>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutConfirm(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-safe shadow-modal animate-bottom-sheet-in md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[360px] md:rounded-3xl">
            <div className="flex justify-center mb-1">
              <div className="w-8 h-1 rounded-full bg-stone-200 md:hidden" />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4 mt-2">
              <LogOut size={24} className="text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-stone-900 text-center mb-2">Log out?</h2>
            <p className="text-stone-500 text-sm text-center mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-2xl border border-stone-200 py-3 text-sm font-bold text-stone-700 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-black text-white shadow-md active:scale-[0.98] transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
