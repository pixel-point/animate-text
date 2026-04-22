import { Children, isValidElement, ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ColProps {
  children: ReactNode;
  className?: string;
}

function Col({ children, className }: ColProps) {
  return <div className={cn(className)}>{children}</div>;
}

interface GridProps {
  children: ReactNode;
  className?: string;
  countColumns?: 1 | 2 | 3;
}

const getGridColsClass = (count: number) => {
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  return 'grid-cols-1 sm:grid-cols-3';
};

function Grid({ children, className, countColumns = undefined, ...props }: GridProps) {
  const childrenArray = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<ColProps>[];
  const gridColsClass = getGridColsClass(countColumns ?? childrenArray.length);

  return (
    <div className={cn('not-prose my-8 grid gap-4', gridColsClass, className)} {...props}>
      {children}
    </div>
  );
}

export { Col, Grid };
