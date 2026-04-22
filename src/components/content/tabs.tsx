import { Fragment, isValidElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TabsContent, TabsList, TabsTrigger, Tabs as TabsUI } from '@/components/ui/tabs';

function processChildren(node: ReactNode): ReactNode {
  if (node == null || typeof node === 'boolean') {
    return null;
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => <Fragment key={index}>{processChildren(child)}</Fragment>);
  }

  if (isValidElement<React.PropsWithChildren>(node)) {
    if (node.type === Fragment) {
      return <Fragment>{processChildren(node.props.children)}</Fragment>;
    }
    return node;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return node;
  }

  return <Fragment>{node}</Fragment>;
}

interface TabProps {
  label: string;
  children: ReactNode;
  contentProps?: Omit<React.ComponentPropsWithoutRef<typeof TabsContent>, 'value'>;
}

export function Tab({ label, children, contentProps = {} }: TabProps) {
  if (!label) return null;

  const processedChildren = processChildren(children);
  if (processedChildren == null) return null;

  return (
    <TabsContent className="prose-inside-content mt-4 mb-0" value={label} {...contentProps}>
      {processedChildren}
    </TabsContent>
  );
}

export interface TabsProps {
  labels: string[];
  defaultValue?: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ labels, defaultValue, children, className }: TabsProps) {
  return (
    <div className={cn('w-full max-w-full overflow-hidden', className)}>
      <TabsUI className="w-full" defaultValue={defaultValue || labels[0]}>
        <TabsList className="h-11 w-full rounded-none border-b border-border bg-transparent p-0">
          <ScrollArea className="w-full">
            <div className="flex w-fit gap-x-5">
              {labels.map((label, index) => (
                <TabsTrigger
                  className={cn(
                    'group relative h-11 px-0 leading-none font-semibold tracking-tight text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:transition-none',
                    'hover:text-foreground/80 hover:after:opacity-20',
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity after:duration-300 after:ease-in-out after:content-['']",
                    'data-[state=active]:after:opacity-100',
                  )}
                  value={label}
                  key={index}
                >
                  <span className="rounded group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
                    {label}
                  </span>
                </TabsTrigger>
              ))}
            </div>
            <ScrollBar className="invisible" orientation="horizontal" />
          </ScrollArea>
        </TabsList>
        {children}
      </TabsUI>
    </div>
  );
}
