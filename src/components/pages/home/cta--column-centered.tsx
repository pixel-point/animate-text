import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ICtaSection } from '@/types/landing';
import { type ReactNode } from 'react';

interface ICTAProps extends ICtaSection {
  className?: string;
  actions?: ReactNode;
}

function CTA({ className, label, title, description, actions }: ICTAProps) {
  return (
    <section className={cn('cta py-14 md:py-16 lg:py-24', className)}>
      <div className="mx-auto flex max-w-3xl flex-col px-5 md:items-center md:px-8 lg:px-0 xl:px-8">
        {label && <Badge className="mb-5 lg:mb-9">{label}</Badge>}
        <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-center md:text-4xl md:leading-tight lg:text-5xl lg:leading-tighter xl:text-6xl xl:leading-tighter">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-normal tracking-tight text-balance text-muted-foreground md:mt-5 md:text-center">
          {description}
        </p>
        {actions}
      </div>
    </section>
  );
}

export default CTA;
