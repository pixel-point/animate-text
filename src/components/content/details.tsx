import { type IDetailsToggle } from '@/types/common';
import { cn } from '@/lib/utils';

interface IDetailsProps extends IDetailsToggle {
  className?: string;
}

function Details({ title, children, className }: IDetailsProps) {
  return (
    <details className={cn('details my-8', className)}>
      <summary className="not-prose w-fit cursor-pointer rounded text-base leading-snug font-medium tracking-tight text-foreground normal-case outline-offset-4 transition-colors duration-300 hover:text-secondary-foreground/85">
        {` `}
        {title}
      </summary>
      <div className="prose-inside-content mt-4">{children}</div>
    </details>
  );
}

export default Details;
