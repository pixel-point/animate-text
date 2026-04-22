import * as React from 'react';
import type { Route } from 'next';
import NextLink from 'next/link';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const linkVariants = cva(
  'inline-flex items-center gap-x-1.5 rounded font-medium tracking-tight transition-colors duration-300 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'text-link hover:text-link/85',
        muted: 'text-muted-foreground hover:text-link/85',
        foreground: 'text-foreground hover:text-link/85',
        ghost: '',
      },
      size: {
        default: '[&_svg]:size-4',
        sm: 'text-sm [&_svg]:size-3.5',
        lg: 'gap-x-[0.175rem] text-base lg:text-lg [&_svg]:size-4.5',
        none: '',
      },
      animation: {
        none: '',
        'arrow-right':
          '[&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  },
);

export interface LinkProps<T extends string = string>
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    VariantProps<typeof linkVariants> {
  asChild?: boolean;
  href: string | URL | Route<T>;
  animation?: 'none' | 'arrow-right';
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps<string>>(
  ({ className, variant, size, animation, asChild = false, href, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    const isInternalLink = typeof href === 'string' && href.startsWith('/');

    if (isInternalLink) {
      return (
        <NextLink
          className={cn(linkVariants({ variant, size, animation, className }))}
          href={href}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <Comp
        className={cn(linkVariants({ variant, size, animation, className }))}
        href={href.toString()}
        ref={ref}
        {...props}
      />
    );
  },
);
Link.displayName = 'Link';

export { Link, linkVariants };
