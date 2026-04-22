'use client';

import { type IFaqItem } from '@/types/common';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';

interface IComplianceBadge {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface IComplianceProps {
  className?: string;
  title: string;
  description: string;
  badges: IComplianceBadge[];
  items: IFaqItem[];
}

function Compliance({ className, title, description, badges, items }: IComplianceProps) {
  return (
    <section className={cn('compliance py-12 md:py-14 lg:py-16 xl:py-24', className)}>
      <div className="mx-auto flex w-full max-w-full flex-col gap-7 px-5 md:max-w-160 md:gap-7 md:px-8 lg:max-w-5xl lg:flex-row lg:items-start lg:justify-between lg:gap-0 xl:max-w-304">
        <div className="flex flex-col gap-5 md:gap-7 lg:w-104 lg:gap-10 xl:w-120 xl:gap-16">
          <header className="flex flex-col gap-2 md:gap-3 lg:gap-4">
            <h2 className="max-w-3xl font-heading text-2xl leading-snug font-semibold tracking-tight text-balance text-foreground md:text-4xl md:leading-tight lg:text-5xl lg:leading-[1.125] xl:text-5xl">
              {title}
            </h2>
            <p className="text-base leading-snug font-medium tracking-tight text-balance text-muted-foreground md:text-lg md:leading-snug lg:text-xl lg:leading-normal xl:text-xl xl:leading-normal">
              {description}
            </p>
          </header>

          <div className="flex items-center gap-6 lg:gap-8">
            {badges.map((badge, index) => (
              <Image
                key={index}
                src={badge.src ?? '/images/cover-1.jpg'}
                alt={badge.alt ?? ''}
                width={badge.width ?? 72}
                height={badge.height ?? 72}
                className="h-18 w-auto shrink-0"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        <div className="w-full lg:w-120 xl:w-136">
          <Accordion type="single" collapsible defaultValue="item-0">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={index === 0 ? 'pb-3' : undefined}
              >
                <AccordionTrigger className="gap-6 py-3 text-lg leading-tight font-medium tracking-tight text-foreground hover:no-underline md:py-4 lg:py-5 lg:text-xl xl:py-5 [&>svg]:size-7 [&>svg]:shrink-0 [&>svg]:text-foreground [&[data-state=closed]>svg]:text-muted-foreground">
                  <span>{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pr-0 text-sm leading-snug tracking-tight text-muted-foreground md:text-base md:leading-snug lg:pr-20 lg:text-lg lg:leading-normal xl:pr-20 xl:text-lg xl:leading-normal">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default Compliance;
