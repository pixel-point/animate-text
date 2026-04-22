import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type ISectionSplit } from '@/types/landing';
import { type ReactNode } from 'react';

interface ISectionSplitProps extends ISectionSplit {
  className?: string;
  actions?: ReactNode;
}

function SectionSplit({
  className,
  label,
  title,
  description,
  image,
  actions,
}: ISectionSplitProps) {
  return (
    <section className={cn('section-split w-full py-12 md:py-14 lg:py-16 xl:py-24', className)}>
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-x-16 gap-y-10 px-5 md:gap-y-14 md:px-8 lg:grid lg:grid-cols-2 xl:gap-x-32">
        <header className="mx-auto flex w-full max-w-xl flex-col md:max-w-3xl">
          {label && <Badge className="mb-5 lg:mb-9">{label}</Badge>}
          <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl md:leading-tight lg:text-5xl lg:leading-tighter">
            {title}
          </h2>
          {description && (
            <p className="mt-3 max-w-2xl text-lg leading-normal tracking-tight text-balance text-muted-foreground md:mt-5">
              {description}
            </p>
          )}
          {actions}
        </header>

        <div className="aspect-square w-full max-w-lg shrink-0 overflow-hidden rounded-md md:rounded-xl lg:order-first lg:max-w-full">
          <Image
            className="h-auto w-full rounded-md md:rounded-xl"
            src={image.src ?? '/images/cover-1.jpg'}
            alt={image.alt ?? ''}
            width={image.width ?? 544}
            height={image.height ?? 544}
          />
        </div>
      </div>
    </section>
  );
}

export default SectionSplit;
