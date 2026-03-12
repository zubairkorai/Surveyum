'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, BarChart2, User, LogOut, Menu, X } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import { cn } from '@/lib/utils';
import { Profile } from '@/types';

import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  profile: Profile | null;
  userEmail: string | undefined;
}

export function Sidebar({ profile, userEmail }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { label: 'My Surveys', href: '/surveys', icon: LayoutDashboard },
    { label: 'Create New', href: '/surveys/new', icon: PlusCircle },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  const NavContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <Link href="/surveys" className="text-xl font-bold text-blue-600 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20">S</div>
          Surveyum
        </Link>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all rounded-xl group",
                isActive 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="mb-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-2">Appearance</p>
          <ThemeToggle />
        </div>

        <Link
          href="/profile"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all border border-transparent",
            pathname === '/profile' 
              ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm" 
              : "hover:bg-white dark:hover:bg-gray-800 hover:border-gray-100 dark:hover:border-gray-700 hover:shadow-sm"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-tighter">
              View Profile
            </p>
          </div>
        </Link>
        
        <form action={signOut} className="mt-2">
          <button className="flex items-center gap-3 px-4 py-2 text-[10px] font-black text-red-400 hover:text-red-600 transition-colors w-full text-left uppercase tracking-widest">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0B0F19] border-r dark:border-gray-800 flex-col fixed inset-y-0 z-50">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0B0F19] z-[70] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavContent />
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-white dark:bg-[#0B0F19] border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/surveys" className="text-lg font-black text-blue-600 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px]">S</div>
          Surveyum
        </Link>
        <div className="flex items-center gap-3">
           <Link href="/profile" className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 overflow-hidden border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-blue-400 dark:text-blue-300" />
              )}
           </Link>
           <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>
    </>
  );
}
