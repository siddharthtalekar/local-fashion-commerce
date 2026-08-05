'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import {
  LayoutDashboard, Package, Tag, Settings, LogOut, PackageCheck,
  BarChart2, Menu, X, ChevronRight, Store, Sparkles, Bell,
} from 'lucide-react';
import type { StoreSummaryDto } from '@local-fashion/shared-types';
import { Providers } from './Providers';

const NAV_ITEMS = [
  { name: 'Dashboard',     href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders',        href: '/orders',    icon: PackageCheck },
  { name: 'Products',      href: '/products',  icon: Package },
  { name: 'Offers',        href: '/offers',    icon: Tag },
  { name: 'Analytics',     href: '/analytics', icon: BarChart2 },
  { name: 'Store Settings',href: '/settings',  icon: Settings },
];

function SidebarContent({
  user, myStore, pathname, onLogout,
}: {
  user: { name: string; phone: string; role: string } | null; myStore: StoreSummaryDto | null; pathname: string; onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
            LocalFashion
          </span>
        </div>

        {myStore && (
          <div className="bg-white/[0.06] rounded-2xl px-4 py-3 border border-white/[0.06]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
                {myStore.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{myStore.name}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  myStore.verificationStatus === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {myStore.verificationStatus === 'approved' ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-[#FF3E6C]/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <item.icon size={17} className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#FF3E6C]' : 'group-hover:text-white/80'}`} />
              <span className={isActive ? 'font-bold' : ''}>{item.name === 'Store Settings' ? 'Settings' : item.name}</span>
              {isActive && <ChevronRight size={14} className="ml-auto text-[#FF3E6C]/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{user?.name}</p>
            <p className="text-white/40 text-xs truncate">{user?.phone}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 justify-center px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const myStore = useStoreProfileStore((s) => s.myStore);
  const setMyStore = useStoreProfileStore((s) => s.setMyStore);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) { router.replace('/login'); return; }

    const checkStore = async () => {
      try {
        const stores = await apiFetch<StoreSummaryDto[]>('/stores/mine', { token });
        if (stores.length === 0) {
          if (pathname !== '/onboarding') router.replace('/onboarding');
        } else {
          setMyStore(stores[0]);
          if (pathname === '/onboarding') router.replace('/dashboard');
        }
      } catch (e) {
        console.error('Failed to fetch stores', e);
      } finally {
        setLoading(false);
      }
    };
    checkStore();
  }, [token, pathname, router, setMyStore, isHydrated]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  if (!isHydrated || !token || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse-brand"
            style={{ background: 'linear-gradient(135deg,#FF3E6C,#FF6B35)' }}>
            <Sparkles size={20} className="text-white" />
          </div>
          <p className="text-sm text-stone-400 font-medium">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/onboarding') {
    return <Providers><div className="min-h-screen bg-[#F5F5F6]">{children}</div></Providers>;
  }

  const currentPage = NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.name ?? 'Dashboard';

  return (
    <Providers>
      <div className="flex min-h-screen bg-[#F5F5F6]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 bg-[#1A1D2E] flex-col fixed inset-y-0 left-0 z-30">
          <SidebarContent user={user} myStore={myStore} pathname={pathname} onLogout={handleLogout} />
        </aside>

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1A1D2E] flex-col md:hidden transition-transform duration-300 ${
          mobileSidebarOpen ? 'flex translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-4 right-4">
            <button onClick={() => setMobileSidebarOpen(false)}
              className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition">
              <X size={18} />
            </button>
          </div>
          <SidebarContent user={user} myStore={myStore} pathname={pathname} onLogout={handleLogout} />
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
          {/* Top header */}
          <header className="bg-white border-b border-stone-100 sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition flex-shrink-0"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-[#282C3F] truncate" style={{ fontFamily: 'var(--font-display)' }}>
                {currentPage === 'Store Settings' ? 'Settings' : currentPage}
              </h2>
              {myStore && (
                <p className="text-xs text-stone-400 font-medium truncate hidden sm:block">{myStore.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                myStore?.verificationStatus === 'approved'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                <Store size={12} />
                {myStore?.verificationStatus === 'approved' ? 'Verified' : 'Pending Review'}
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
            {children}
          </div>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around z-[50] pb-safe px-1">
            {NAV_ITEMS.slice(0, 5).map((item) => {
              const isActive = pathname.startsWith(item.href);
              const shortName = item.name === 'Store Settings' ? 'Settings' : item.name === 'Dashboard' ? 'Home' : item.name;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-1 gap-0.5 min-w-[56px] transition-all relative ${
                    isActive ? 'text-[#FF3E6C]' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#FF3E6C]" />
                  )}
                  <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#FF3E6C]/10' : ''}`}>
                    <item.icon size={19} className={isActive ? 'fill-[#FF3E6C]/10' : ''} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide`}>{shortName}</span>
                </Link>
              );
            })}
          </nav>
        </main>
      </div>
    </Providers>
  );
}
