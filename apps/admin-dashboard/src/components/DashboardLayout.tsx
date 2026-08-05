'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useStoreProfileStore } from '@/store/storeProfile';
import { apiFetch } from '@/lib/api';
import { LayoutDashboard, Package, Tag, Settings, LogOut, Store, PackageCheck } from 'lucide-react';
import type { StoreSummaryDto } from '@local-fashion/shared-types';

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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) {
      router.replace('/login');
      return;
    }

    const checkStore = async () => {
      try {
        const stores = await apiFetch<StoreSummaryDto[]>('/stores/mine', { token });
        if (stores.length === 0) {
          if (pathname !== '/onboarding') {
            router.replace('/onboarding');
          }
        } else {
          setMyStore(stores[0]);
          if (pathname === '/onboarding') {
            router.replace('/dashboard');
          }
        }
      } catch (e) {
        console.error('Failed to fetch stores', e);
      } finally {
        setLoading(false);
      }
    };

    checkStore();
  }, [token, pathname, router, setMyStore, isHydrated]);

  if (!isHydrated || !token || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg,#FF3E6C,#FF6B35)' }}>
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <p className="text-sm text-stone-400 font-medium">Loading portal...</p>
        </div>
      </div>
    );
  }

  // If we are on the onboarding page, don't show the sidebar
  if (pathname === '/onboarding') {
    return <div className="min-h-screen bg-stone-50">{children}</div>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/orders', icon: PackageCheck },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Offers', href: '/offers', icon: Tag },
    { name: 'Store Settings', href: '/settings', icon: Store },
  ];

  return (
    <div className="flex min-h-screen bg-myntra-gray">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <h1 className="text-xl font-bold text-myntra-dark">Retailer Portal</h1>
          <p className="text-xs text-myntra-lightText mt-1">{myStore?.name ?? 'Loading Store...'}</p>
          {myStore && (
            <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${myStore.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {myStore.verificationStatus}
            </span>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-myntra-pink/10 text-myntra-pink font-bold' : 'text-myntra-text hover:bg-stone-50 hover:text-myntra-dark'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-myntra-dark text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-myntra-dark truncate">{user?.name}</p>
              <p className="text-xs text-myntra-lightText truncate">{user?.phone}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="flex w-full items-center gap-2 justify-center rounded-lg border border-stone-200 py-2 text-sm font-medium text-myntra-text hover:bg-stone-50 hover:text-myntra-dark transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/90 backdrop-blur-md border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-bold text-myntra-dark">{myStore?.name ?? 'Retailer Portal'}</h1>
          <button onClick={() => { logout(); router.replace('/login'); }} className="text-myntra-text hover:text-myntra-dark">
            <LogOut size={20} />
          </button>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around z-50 safe-area-pb px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-1 gap-1 min-w-[64px] transition-all ${
                  isActive ? 'text-myntra-pink scale-110' : 'text-stone-400 hover:text-stone-900'
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-myntra-pink/10' : 'bg-transparent'}`}>
                  <item.icon size={20} className={isActive ? 'fill-myntra-pink/20' : ''} />
                </div>
                <span className={`text-[9px] font-bold ${isActive ? 'text-myntra-pink' : 'font-medium'}`}>
                  {item.name === 'Store Settings' ? 'Settings' : item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
