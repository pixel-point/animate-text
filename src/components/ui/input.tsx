import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base leading-snug tracking-tight transition-colors duration-300 remove-autocomplete-styles file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:border-accent-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
