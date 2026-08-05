'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import {
  LayoutDashboard, Store, Tag, Copyright, LogOut,
  Users, Package, ShoppingBag, Menu, X, ChevronRight,
  Shield, Globe,
} from 'lucide-react';
import { Toast } from '@local-fashion/ui';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard, section: null },
  { name: 'Users', href: '/users', icon: Users, section: 'People' },
  { name: 'Active Stores', href: '/stores/active', icon: Store, section: 'Stores' },
  { name: 'Approvals', href: '/stores/pending', icon: Shield, section: 'Stores' },
  { name: 'Orders', href: '/orders', icon: ShoppingBag, section: 'Commerce' },
  { name: 'Products', href: '/products', icon: Package, section: 'Commerce' },
  { name: 'Categories', href: '/categories', icon: Tag, section: 'Taxonomy' },
  { name: 'Brands', href: '/brands', icon: Copyright, section: 'Taxonomy' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token || user?.role !== 'admin') router.replace('/login');
  }, [token, user, router, isHydrated]);

  if (!isHydrated || !token || user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Authenticating…</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); router.replace('/login'); };

  const sections = ['People', 'Stores', 'Commerce', 'Taxonomy'];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-widest uppercase">LocalFashion</p>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Admin Control Center</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide space-y-6">
        {/* Overview */}
        <div>
          {navItems.filter(i => !i.section).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={16} />
                <span>{item.name}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            );
          })}
        </div>

        {sections.map((section) => {
          const items = navItems.filter(i => i.section === section);
          if (!items.length) return null;
          return (
            <div key={section}>
              <p className="text-[10px] font-black uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text-muted)' }}>
                {section}
              </p>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}>
                    <Icon size={16} />
                    <span>{item.name}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #FF3E6C, #FF6B35)' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>Super Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="sidebar-link w-full hover:text-rose-400 hover:bg-rose-500/10">
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Toast />

      {/* Desktop Sidebar */}
      <aside className="w-60 hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 z-10 flex flex-col"
            style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b"
          style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white p-1">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-rose-400" />
            <span className="font-black text-white text-sm tracking-wider">ADMIN</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors p-1">
            <LogOut size={18} />
          </button>
        </header>

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b sticky top-0 z-20"
          style={{ background: 'rgba(13,17,23,0.9)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {navItems.find(i => i.href === '/' ? pathname === '/' : pathname.startsWith(i.href))?.section ?? 'Overview'}
            </p>
            <h1 className="text-lg font-black text-white">
              {navItems.find(i => i.href === '/' ? pathname === '/' : pathname.startsWith(i.href))?.name ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Globe size={14} />
            <span className="font-medium">LocalFashion Platform</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
