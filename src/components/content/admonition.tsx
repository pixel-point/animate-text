import { type IAdmonition } from '@/types/common';
import { cn } from '@/lib/utils';

interface IAdmonitionProps extends IAdmonition {
  className?: string;
}

function Admonition({ title = 'Good to know', children, className }: IAdmonitionProps) {
  return (
    <figure
      className={cn(
        'not-prose admonition my-8 flex flex-col rounded-lg border border-border bg-background p-5 pt-4',
        className,
      )}
    >
      <span className="not-prose flex text-[0.8125rem] leading-none font-semibold tracking-tight text-muted-foreground">
        {title}
      </span>
      <div className="prose-inside-content prose mt-3.5 max-w-none border-t border-border pt-3.5">
        {children}
      </div>
    </figure>
  );
}

export default Admonition;
