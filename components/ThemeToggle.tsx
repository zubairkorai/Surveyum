'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'system', label: 'Auto', icon: Monitor },
    { id: 'dark', label: 'Dark', icon: Moon },
  ] as const;

  return (
    <div className={cn(
      "flex items-center bg-gray-100/80 dark:bg-gray-900/50 p-1 rounded-xl w-full max-w-full overflow-hidden", 
      className
    )}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;
        
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all duration-200",
              isActive 
                ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tight truncate">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
