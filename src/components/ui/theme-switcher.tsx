'use client';

import { useEffect, useState } from 'react';
import { cva } from 'class-variance-authority';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

interface IThemeSwitcherProps {
  className?: string;
  size?: 'default' | 'md';
}

const themeSwitcherVariants = cva(
  'flex w-fit items-center gap-x-0.5 rounded-full border border-input bg-transparent text-muted-foreground',
  {
    variants: {
      size: {
        default: 'h-7',
        md: 'h-8',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export function ThemeSwitcher({ className, size = 'default' }: IThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(themeSwitcherVariants({ size }), className)}>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'flex items-center justify-center rounded-full border border-l-0 border-transparent transition-colors duration-300 hover:text-foreground/80 focus-visible:ring-offset-0',
          {
            'size-7': size === 'default',
            'size-8': size === 'md',
          },
          mounted && theme === 'system' && 'border-input text-foreground',
        )}
      >
        <Monitor className="shrink-0" size={14} />
        <span className="sr-only">System theme</span>
      </button>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'flex items-center justify-center rounded-full border border-transparent transition-colors duration-300 hover:text-foreground/80 focus-visible:ring-offset-0',
          {
            'size-7': size === 'default',
            'size-8': size === 'md',
          },
          mounted && theme === 'light' && 'border-input text-foreground',
        )}
      >
        <Sun className="shrink-0" size={14} />
        <span className="sr-only">Light theme</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'flex items-center justify-center rounded-full border border-r-0 border-transparent transition-colors duration-300 hover:text-foreground/80 focus-visible:ring-offset-0',
          {
            'size-7': size === 'default',
            'size-8': size === 'md',
          },
          mounted && theme === 'dark' && 'border-input bg-background text-foreground',
        )}
      >
        <Moon className="shrink-0" size={14} />
        <span className="sr-only">Dark theme</span>
      </button>
    </div>
  );
}
