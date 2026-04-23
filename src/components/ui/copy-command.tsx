'use client';

import * as React from 'react';
import { CheckIcon, CopyIcon } from '@phosphor-icons/react/ssr';
import { cva, type VariantProps } from 'class-variance-authority';

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

type CopyCommandIconWeight = React.ComponentProps<typeof CopyIcon>['weight'];

export interface CopyCommandProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof copyCommandVariants> {
  command: string;
  inlineEditPath?: string;
  prefix?: string;
  showFade?: boolean;
  fadeClassName?: string;
  commandClassName?: string;
  contentClassName?: string;
  copyButtonClassName?: string;
  copyAriaLabel?: string;
  copyIconClassName?: string;
  copyIconWeight?: CopyCommandIconWeight;
}

function CopyCommand({
  command,
  inlineEditPath,
  size,
  className,
  prefix,
  showFade = false,
  fadeClassName,
  commandClassName,
  contentClassName,
  copyButtonClassName,
  copyAriaLabel,
  copyIconClassName,
  copyIconWeight,
  ...props
}: CopyCommandProps) {
  const { isCopied, handleCopy } = useCopyToClipboard(2000);

  return (
    <div className={cn(copyCommandVariants({ size }), className)} {...props}>
      <div className={cn('relative min-w-0 flex-1 overflow-hidden', contentClassName)}>
        <code
          className={cn(
            'flex min-w-0 items-center overflow-hidden text-sm leading-snug tracking-tight text-muted-foreground',
            inlineEditPath && 'min-w-0',
          )}
        >
          {prefix ? (
            <span className="relative top-px shrink-0 text-[calc(1em+2px)] text-muted-foreground">
              {prefix}
            </span>
          ) : null}
          <span
            className={cn(
              'min-w-0 overflow-hidden whitespace-nowrap',
              !showFade && 'truncate',
              showFade &&
                '[mask-image:linear-gradient(to_right,black_0,black_calc(100%-3rem),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0,black_calc(100%-3rem),transparent_100%)]',
              prefix && 'ml-[1ch]',
              commandClassName,
              fadeClassName,
            )}
            title={command}
          >
            {command}
          </span>
        </code>
      </div>
      <button
        className={cn(
          'flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:text-link/85 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden lg:size-11',
          copyButtonClassName,
        )}
        type="button"
        onClick={() => handleCopy(command)}
        aria-label={isCopied ? 'Copied' : (copyAriaLabel ?? 'Copy to clipboard')}
      >
        {isCopied ? (
          <CheckIcon
            className={cn('size-5', copyIconClassName)}
            weight={copyIconWeight ?? 'bold'}
          />
        ) : (
          <CopyIcon className={cn('size-5', copyIconClassName)} weight={copyIconWeight} />
        )}
      </button>
    </div>
  );
}

export { CopyCommand, copyCommandVariants };
