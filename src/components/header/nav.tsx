'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import { IHeaderMenuItem, IHeaderMenuTopLinkItem } from '@/types/common';
import { cn } from '@/lib/utils';
import { Link } from '@/components/ui/link';

interface IHeaderNavProps {
  className?: string;
  items: IHeaderMenuItem[];
}

function Nav({ className, items }: IHeaderNavProps) {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const linkItems = useMemo(
    () =>
      items.filter(
        (item): item is IHeaderMenuTopLinkItem =>
          typeof item.href === 'string' || item.href instanceof URL,
      ),
    [items],
  );

  const activeIndex = useMemo(
    () =>
      linkItems.findIndex(({ href }) => {
        const hrefPath = href instanceof URL ? href.pathname : href;

        return hrefPath === '/'
          ? pathname === '/'
          : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
      }),
    [pathname, linkItems],
  );

  return (
    <nav className={cn('flex', className)} onMouseLeave={() => setHoveredIndex(null)}>
      {linkItems.map(({ href, label }, index) => {
        const isActive = index === activeIndex;
        const isHovered = index === hoveredIndex;
        const shouldShowActive = isActive && hoveredIndex === null;
        const shouldShowHighlight = isHovered || shouldShowActive;

        return (
          <Link
            key={index}
            href={href}
            data-active={shouldShowActive}
            data-hovered={isHovered}
            onMouseEnter={() => setHoveredIndex(index)}
            className={cn(
              'relative gap-x-1.5 rounded-full px-3.5 py-2 text-sm leading-none tracking-normal transition-colors data-[active=true]:text-foreground data-[hovered=true]:text-foreground',
              isActive ? 'text-foreground' : 'text-foreground/80',
            )}
            size="none"
            variant="ghost"
          >
            <span
              className={cn(
                'pointer-events-none absolute inset-0 rounded-full bg-muted transition-opacity duration-300',
                shouldShowHighlight ? 'opacity-100' : 'opacity-0',
              )}
            />
            <span className="relative z-10">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default Nav;
