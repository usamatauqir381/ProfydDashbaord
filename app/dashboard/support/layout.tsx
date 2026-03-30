"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Calendar, 
  Heart, 
  FileText,
  Home,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SupportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/support', icon: LayoutDashboard },
    { name: 'Students', href: '/support/students', icon: Users },
    { name: 'Lessons', href: '/support/lessons', icon: BookOpen },
    { name: 'Revenue', href: '/support/revenue', icon: DollarSign },
    { name: 'Sales', href: '/support/sales', icon: ShoppingCart },
    { name: 'Packages', href: '/support/packages', icon: Package },
    { name: 'Capacity', href: '/support/capacity', icon: Calendar },
    { name: 'Retention', href: '/support/retention', icon: Heart },
    { name: 'Reports', href: '/support/reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Support Portal</h1>
          <p className="text-xs text-gray-500 mt-1">Operations & Retention</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition",
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? "bg-gray-100 text-primary font-medium"
                  : ""
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-3 text-gray-500 hover:text-gray-700">
            <Home size={20} />
            <span>Main Menu</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}