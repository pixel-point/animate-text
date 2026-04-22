import { Slot } from '@radix-ui/react-slot';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type IFeatureItemIcon, type IFeaturesSection } from '@/types/landing';
import { type ReactNode } from 'react';

interface IFeaturesProps extends Omit<IFeaturesSection, 'features'> {
  className?: string;
  items: IFeatureItemIcon[];
  actions?: ReactNode;
}

function Features({ className, label, title, description, actions, items }: IFeaturesProps) {
  return (
    <section className={cn('features py-12 md:py-14 lg:py-16 xl:py-24', className)}>
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-24 px-5 md:px-8 lg:max-w-4xl lg:px-0 xl:max-w-7xl xl:grid-cols-[30rem_auto] xl:px-8">
        <header className="flex max-w-xl flex-col md:max-w-3xl lg:max-w-2xl">
          {label && <Badge className="mb-5 lg:mb-9">{label}</Badge>}
          <h2 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl md:leading-tight lg:text-5xl lg:leading-tighter">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-normal tracking-tight text-balance text-muted-foreground md:mt-5">
            {description}
          </p>
          {actions}
        </header>

        <Separator className="my-14 lg:mt-32 xl:hidden" />

        <ul className="grid max-w-sm grid-cols-1 gap-x-16 gap-y-9 sm:max-w-none sm:grid-cols-2 md:gap-y-16 lg:grid-cols-3 xl:grid-cols-2 xl:gap-y-14">
          {items.map(({ lucideIcon, title, description }, index) => (
            <li key={index} className="flex max-w-sm flex-col sm:max-w-none">
              <Slot className="mb-2 size-8 shrink-0 text-foreground md:mb-3 md:size-9">
                {lucideIcon}
              </Slot>
              <h3 className="mb-1.5 font-sans text-lg leading-snug font-semibold tracking-tight md:mb-2 md:text-xl md:leading-snug">
                {title}
              </h3>
              <p className="text-base leading-snug tracking-tight text-pretty text-muted-foreground md:text-lg md:leading-snug">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Features;
