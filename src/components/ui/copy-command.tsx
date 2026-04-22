'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import useCopyToClipboard from '@/hooks/use-copy-to-clipboard';
const copyCommandVariants = cva(
  'inline-flex w-full items-center justify-between gap-4 b-rounded-md border border-border bg-background pl-3 font-mono text-sm tracking-tight text-muted-foreground transition-colors',
  {
    variants: {
      size: {
        default: 'h-10 lg:h-11',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface CopyCommandProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof copyCommandVariants> {
  command: string;
  inlineEditPath?: string;
}

function CopyCommand({ command, inlineEditPath, size, className, ...props }: CopyCommandProps) {
  const { isCopied, handleCopy } = useCopyToClipboard(2000);

  return (
    <div className={cn(copyCommandVariants({ size }), className)} {...props}>
      {inlineEditPath ? (
        <span className="truncate text-sm leading-snug tracking-tight text-muted-foreground">
          {command}
        </span>
      ) : (
        <span className="truncate text-sm leading-snug tracking-tight text-muted-foreground">
          {command}
        </span>
      )}
      <button
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center text-foreground transition-colors hover:text-link/85 lg:size-11"
        type="button"
        onClick={() => handleCopy(command)}
        aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
      >
        {isCopied ? <Check className="size-5" strokeWidth={2.5} /> : <Copy className="size-5" />}
      </button>
    </div>
  );
}

export { CopyCommand, copyCommandVariants };
