import { Children, cloneElement, createElement, isValidElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StepProps {
  title: string;
  children: ReactNode;
  number?: number;
  headingTag?: 'h2' | 'h3' | 'h4';
}

function Step({ title, number, headingTag: HeadingTag = 'h3', children, ...props }: StepProps) {
  return (
    <li className="flex flex-col pl-0" {...props}>
      <div className="flex items-start gap-x-5">
        <span className="not-prose relative top-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-xs leading-none font-medium tracking-tight text-foreground ring-4 ring-background md:size-9 md:text-sm md:leading-none">
          {number}
        </span>
        {createElement(
          HeadingTag,
          {
            className:
              'not-prose pt-1 text-xl leading-snug font-semibold tracking-tight text-foreground',
          },
          title,
        )}
      </div>
      <div className="steps-content mt-4 pb-8 pl-11 md:pl-14">{children}</div>
    </li>
  );
}

interface StepsProps {
  children: ReactNode;
}

function Steps({ children, ...props }: StepsProps) {
  const cardChildren = Children.toArray(children).filter((child) => isValidElement(child));

  const cardsWithAutoNumber = cardChildren.map((child, index) => {
    return cloneElement(child as React.ReactElement<StepProps>, {
      number: index + 1,
    });
  });

  return (
    <ol
      className={cn(
        'steps relative my-6 flex flex-col gap-3 gap-y-7 pl-0 md:my-8',
        'before:absolute before:inset-y-0 before:left-3.5 before:w-px before:-translate-x-px before:bg-border md:before:left-4.5',
      )}
      {...props}
    >
      {cardsWithAutoNumber}
    </ol>
  );
}

export { Steps, Step };
