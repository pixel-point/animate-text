'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { IMenuItem } from '@/types/common';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';

import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { useMetaColor } from '@/hooks/use-meta-color';
import config from '@/configs/website-config';
interface MobileMenuProps {
  items: IMenuItem[];
}

type MenuItemWithChildren = IMenuItem & {
  children?: IMenuItem[];
};

type MenuItemWithDropdown = IMenuItem & {
  dropdown?: {
    columns?: Array<{
      items?: IMenuItem[];
    }>;
  };
};

function resolveMobileChildren(item: IMenuItem): IMenuItem[] {
  const children = (item as MenuItemWithChildren).children;
  if (Array.isArray(children) && children.length > 0) {
    return children;
  }

  const dropdown = (item as MenuItemWithDropdown).dropdown;
  if (!dropdown || !Array.isArray(dropdown.columns) || dropdown.columns.length === 0) {
    return [];
  }

  return dropdown.columns.flatMap((column) => (Array.isArray(column.items) ? column.items : []));
}

function hasActiveDescendant(item: IMenuItem, currentPath: string): boolean {
  if (item.href === currentPath) return true;
  const children = resolveMobileChildren(item);
  if (children.length > 0) {
    return children.some((child) => hasActiveDescendant(child, currentPath));
  }
  return false;
}

interface RecursiveMenuItemComponentProps {
  item: IMenuItem;
  depth: number;
  currentPath: string;
}

function RecursiveMenuItemComponent({ item, depth, currentPath }: RecursiveMenuItemComponentProps) {
  const childItems = resolveMobileChildren(item);
  const hasChildren = childItems.length > 0;
  const isActive = hasActiveDescendant(item, currentPath);
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive, currentPath]);

  if (hasChildren) {
    return (
      <li>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="group flex h-9 w-full items-center justify-between rounded px-0 text-left text-sm font-medium text-foreground transition-colors hover:text-primary [&[data-state=open]>svg]:rotate-90">
            {item.href ? (
              <Link href={item.href} className="text-base leading-snug font-medium tracking-tight">
                {item.label}
              </Link>
            ) : (
              <span className="text-base leading-snug font-medium tracking-tight text-foreground">
                {item.label}
              </span>
            )}
            <ChevronRight className="size-4 shrink-0 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <RecursiveMenu items={childItems} depth={depth + 1} />
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  if (!item.href) {
    return null;
  }

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex h-9 flex-1 items-center text-base leading-snug font-medium tracking-tight hover:text-primary',
          isActive ? 'text-primary' : 'text-foreground',
        )}
      >
        {item.label}
      </Link>
    </li>
  );
}

function RecursiveMenu({ items, depth = 0 }: { items: IMenuItem[]; depth?: number }) {
  const pathname = usePathname();

  return (
    <ul className={cn('flex flex-col', depth > 0 && 'border-l border-border pl-4')}>
      {items.map((item, idx) => (
        <RecursiveMenuItemComponent key={idx} item={item} depth={depth} currentPath={pathname} />
      ))}
    </ul>
  );
}

function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { setMetaColor, metaColor } = useMetaColor();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const onOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);

      setMetaColor(open ? config.metaThemeColors.dark : metaColor);
    },

    [setMetaColor, metaColor],
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
      preventScrollRestoration
    >
      <DrawerTrigger className="relative ml-4 flex size-6 text-foreground outline-hidden lg:hidden">
        <span className="absolute -inset-3 lg:hidden" />
        <svg
          className="-mr-1.5 shrink-0"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.99902 7.71436H19.999"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.99902 16.2856H19.999"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="sr-only">Open menu</span>
      </DrawerTrigger>
      <DrawerContent className="flex h-[45dvh] flex-col rounded-t-xl border border-border p-0 lg:hidden">
        <DrawerTitle className="sr-only">Menu</DrawerTitle>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-6 pb-12 md:px-8">
          <RecursiveMenu items={items} />
          <Separator className="mt-3 mb-5" />
          <div className="flex items-center justify-between gap-y-4">
            <span className="inline-block text-base leading-snug font-medium tracking-tight">
              Appearance
            </span>

            <ThemeSwitcher size="md" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full bg-linear-to-b from-transparent to-background"
          aria-hidden
        />
      </DrawerContent>
    </Drawer>
  );
}

export default MobileMenu;
