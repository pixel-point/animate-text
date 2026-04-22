'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ISectionTabs } from '@/types/landing';
import { type ReactNode } from 'react';

interface ISectionTabsProps extends ISectionTabs {
  className?: string;
  actions?: ReactNode;
}

function SectionTabs({ className, label, title, description, actions, items }: ISectionTabsProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.key || '');

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className={cn('section-tabs py-12 md:py-14 lg:py-16 xl:py-24', className)}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <header className="flex max-w-xl flex-col md:max-w-3xl xl:mx-auto xl:max-w-5xl">
          {label && <Badge className="mb-5 lg:mb-9">{label}</Badge>}
          <h2 className="max-w-3xl font-heading text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl md:leading-tight lg:text-5xl lg:leading-tighter">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-lg leading-normal tracking-tight text-balance text-muted-foreground md:mt-5">
            {description}
          </p>
          {actions}
        </header>

        <Tabs
          className="mt-10 flex w-full flex-col md:mx-auto md:items-center lg:mt-12"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          {items.map(({ key, image }, index) => {
            if (key === activeTab) {
              return (
                <TabsContent className="mx-auto mt-0 w-full" key={index} value={key}>
                  <Image
                    className="aspect-video w-full rounded-md md:rounded-xl"
                    src={image.src ?? '/images/cover-4.jpg'}
                    alt={image.alt ?? ''}
                    width={image.width ?? 1216}
                    height={image.height ?? 684}
                    quality={95}
                  />
                </TabsContent>
              );
            }
          })}
          <TabsList className="relative -mx-5 mt-4 mb-6 flex h-11 w-fit max-w-[calc(100%+2.5rem)] rounded-none bg-transparent p-0 md:-mx-8 md:mt-6 md:mb-9 md:max-w-[calc(100%+4rem)] lg:mt-12 xl:mx-auto xl:max-w-full">
            <ScrollArea className="w-full">
              <div className="relative mx-5 flex w-fit gap-x-7 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border md:mx-8">
                {items.map((item, index) => (
                  <TabsTrigger
                    className={cn(
                      'relative z-10 h-11 px-0 text-sm leading-none font-semibold tracking-tight text-muted-foreground',
                      'hover:text-foreground/80',
                      "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity after:duration-300 after:ease-in-out after:content-['']",
                      'data-[state=active]:after:opacity-100',
                    )}
                    value={item.key}
                    key={index}
                  >
                    {item.key === activeTab ? <span>{item.label}</span> : item.label}
                  </TabsTrigger>
                ))}
              </div>
              <ScrollBar className="invisible" orientation="horizontal" />
            </ScrollArea>
            <div
              className="pointer-events-none absolute top-0 left-0 z-10 h-full w-5 bg-linear-to-r from-background to-transparent md:w-8"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute top-0 right-0 z-10 h-full w-5 bg-linear-to-l from-background to-transparent md:w-8"
              aria-hidden
            />
          </TabsList>
          {items.map((item, index) => {
            if (item.key === activeTab) {
              return (
                <TabsContent
                  className="mt-0 flex max-w-2xl flex-col md:mx-auto md:text-center xl:max-w-3xl"
                  key={index}
                  value={item.key}
                >
                  <p className="text-base leading-snug tracking-tight text-pretty text-muted-foreground">
                    {item.description}
                  </p>
                </TabsContent>
              );
            }
          })}
        </Tabs>
      </div>
    </section>
  );
}

export default SectionTabs;
