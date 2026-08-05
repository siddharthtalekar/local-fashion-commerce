'use client';

import Link from 'next/link';
import {
  LayoutDashboard, Package, Tag, Settings, LogOut, PackageCheck,
  BarChart2, Menu, X, ChevronRight, Store, Sparkles, Bell,
} from 'lucide-react';
import type { ElementType } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: ElementType;
}

interface DashboardNavProps {
  items: NavItem[];
  pathname: string;
}

export function DashboardNav({ items, pathname }: DashboardNavProps) {
  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group ${
              isActive 
                ? 'bg-white/[0.08] text-white' 
                : 'text-stone-400 hover:bg-white/[0.04] hover:text-stone-200'
            }`}
          >
            <item.icon size={20} className={`flex-shrink-0 ${isActive ? 'text-[#FF3E6C]' : 'text-stone-500 group-hover:text-stone-400'}`} />
            <span className="font-semibold text-sm">{item.name}</span>
            {isActive && (
              <ChevronRight size={16} className="ml-auto text-white/30" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
