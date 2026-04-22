import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base tracking-tight ring-offset-background placeholder:text-muted-foreground focus-visible:border-accent-foreground focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
