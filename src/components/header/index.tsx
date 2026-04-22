'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import config from '@/configs/website-config';

import { IHeaderMenuItem } from '@/types/common';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/ui/search-bar';

import MobileMenu from './mobile-menu';
import Nav from './nav';

const LOGO_BOX_HEIGHT = 22;

interface IHeaderProps {
  className?: string;
  menuItems: IHeaderMenuItem[];
  logoUrl?: string | null;
  darkLogoUrl?: string | null;
  logoAlt?: string | null;
}

function Header({ className, menuItems, logoUrl, darkLogoUrl, logoAlt }: IHeaderProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const lightLogoSrc = logoUrl ?? config.logo.light;
  const darkLogoSrc = darkLogoUrl ?? logoUrl ?? config.logo.dark;
  const logoHref = config.logoLink ?? '/';
  const resolvedLogoAlt =
    typeof logoAlt === 'string' && logoAlt.trim().length > 0
      ? logoAlt
      : typeof config.logoAlt === 'string' && config.logoAlt.trim().length > 0
        ? config.logoAlt
        : config.projectName;

  useEffect(() => {
    if (!triggerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      },
    );

    observer.observe(triggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none -mt-px h-px w-full" ref={triggerRef} aria-hidden="true" />
      <header
        className={cn(
          'sticky top-0 z-50 flex min-h-[3.3125rem] items-center border-b border-transparent bg-background/90 py-3 backdrop-blur lg:py-2.5',
          isIntersecting && 'border-border',
          className,
        )}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 md:px-8 lg:justify-start">
          <NextLink className="mr-5 inline-flex shrink-0 rounded lg:mr-7" href={logoHref}>
            <>
              <img
                className="hidden h-[22px] w-auto shrink-0 dark:block"
                src={darkLogoSrc}
                alt={resolvedLogoAlt}
                height={LOGO_BOX_HEIGHT}
              />
              <img
                className="h-[22px] w-auto shrink-0 dark:hidden"
                src={lightLogoSrc}
                alt={resolvedLogoAlt}
                height={LOGO_BOX_HEIGHT}
              />
            </>
          </NextLink>
          <Nav className="hidden lg:flex" items={menuItems} />
          <SearchBar className="max-w-80 lg:hidden" showOnRoute={[]} enableCmdK={false} />
          <div className="hidden grow items-center justify-end gap-x-2.5 lg:flex">
            <Button size="sm" variant="outline">
              Login
            </Button>
            <Button size="sm" asChild>
              <NextLink href="/">Get Started</NextLink>
            </Button>
          </div>
          <MobileMenu items={menuItems} />
        </div>
      </header>
    </>
  );
}

export default Header;
