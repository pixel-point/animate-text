'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@phosphor-icons/react/ssr';
import { cva } from 'class-variance-authority';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

interface IThemeSwitcherProps {
  className?: string;
  size?: 'default' | 'md';
}

const themeSwitcherVariants = cva(
  'inline-flex items-center justify-center rounded-full border border-foreground/10 bg-transparent text-muted-foreground transition-colors duration-300 hover:border-foreground/40 hover:text-foreground/80 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:outline-hidden',
  {
    variants: {
      size: {
        default: 'size-8',
        md: 'size-9',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export function ThemeSwitcher({ className, size = 'default' }: IThemeSwitcherProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(themeSwitcherVariants({ size }), className)}
      aria-label={label}
      title={label}
    >
      {isDark ? (
        <SunIcon className="shrink-0" size={16} />
      ) : (
        <MoonIcon className="shrink-0" size={16} />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
