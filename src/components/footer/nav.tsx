'use client';

import { usePathname } from 'next/navigation';

import { IMenuItem } from '@/types/common';
import { cn } from '@/lib/utils';
import { Link } from '@/components/ui/link';

interface IFooterNavProps {
  className?: string;
  items: IMenuItem[];
}

function Nav({ className, items }: IFooterNavProps) {
  const pathname = usePathname();
  const links = items.filter((item): item is IMenuItem & { href: NonNullable<IMenuItem['href']> } =>
    Boolean(item.href),
  );

  return (
    <nav className={cn('flex flex-wrap gap-5 text-sm', className)}>
      {links.map(({ href, label }, index) => {
        const hrefPath = href instanceof URL ? href.pathname : href;
        const isActive =
          hrefPath === '/'
            ? pathname === '/'
            : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
        return (
          <Link
            className={cn('leading-none', isActive && 'text-foreground')}
            size="none"
            variant="foreground"
            key={index}
            href={href}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default Nav;
