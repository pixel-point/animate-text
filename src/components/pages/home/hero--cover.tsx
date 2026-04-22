import { CopyCommand } from '@/components/ui/copy-command';
import { cn } from '@/lib/utils';
import { type IHeroSection } from '@/types/landing';
import { type ReactNode } from 'react';

export interface IHeroProps extends Omit<IHeroSection, 'image' | 'logos'> {
  className?: string;
  command?: string;
  actions?: ReactNode;
}

function Hero({ title, description, actions, command, className }: IHeroProps) {
  return (
    <section className={cn('hero pb-12 md:pb-14 lg:pb-16 xl:pb-24', className)}>
      <div className="grid min-h-150 grid-cols-1 grid-rows-1 md:min-h-212 lg:min-h-195 xl:min-h-234">
        <div className="col-span-full row-span-full"></div>
        <div className="col-span-full row-span-full bg-muted/70 px-5 md:px-8 dark:bg-muted/45">
          <div className="mx-auto flex h-full w-full max-w-386 flex-col justify-between gap-12 py-10 md:gap-16 md:pt-14 md:pb-13 lg:gap-20 lg:py-16 xl:pt-18 xl:pb-13">
            <h1 className="max-w-full font-heading text-3xl leading-tight font-semibold tracking-tight text-foreground md:max-w-152 md:text-5xl md:leading-[1.125] lg:max-w-232 lg:text-6xl lg:leading-tighter xl:max-w-3xl xl:text-7xl xl:leading-[1.125]">
              {title}
            </h1>
            <div className="mt-auto flex w-full flex-col items-start gap-5 md:gap-8 xl:flex-row xl:items-end xl:justify-between xl:gap-5">
              <p className="max-w-full text-base leading-snug tracking-tight text-balance md:max-w-152 md:text-2xl md:leading-tight lg:max-w-157 xl:max-w-2xl">
                {description}
              </p>
              <div className="flex w-full shrink-0 flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-6 xl:w-fit xl:gap-4">
                {actions}
                {command && (
                  <CopyCommand
                    className="w-full max-w-full md:max-w-none md:flex-1 lg:w-fit lg:max-w-85"
                    command={command}
                    inlineEditPath="command"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
