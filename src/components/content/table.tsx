import { PropsWithChildren } from 'react';

import { TTableTheme } from '@/types/common';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const defaultCellStyles =
  'text-left text-sm leading-snug tracking-tight pt-3 align-top text-foreground';

export type TTableTypes = 'withTopHeader' | 'withoutHeader';

export interface IContentTable {
  type: TTableTypes;
  theme?: TTableTheme;
  table: {
    rows: {
      cells: string[];
    }[];
  };
}

const CodeText = ({ text }: { text: string }) => {
  return text.split(/(`[^`]*`)/).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code className="w-max max-w-[30ch]" key={index}>
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
    ),
  );
};

interface ITableWrapperProps {
  className?: string;
}

export function TableWrapper({ children, className }: PropsWithChildren<ITableWrapperProps>) {
  return (
    <figure className={cn('not-prose -mx-5 my-8 md:mx-0', className)}>
      <ScrollArea className="w-full">
        {children}
        <ScrollBar className="invisible" orientation="horizontal" />
      </ScrollArea>
    </figure>
  );
}

interface ITableProps extends IContentTable {
  className?: string;
}

export function Table({ table, type, theme = 'filled', className }: ITableProps) {
  const { rows } = table;

  const tableHead = type === 'withTopHeader' ? rows.slice(0, 1) : [];
  const tableBoby = type === 'withTopHeader' ? rows.slice(1) : rows;

  const isFilled = theme === 'filled';

  return (
    <TableWrapper className={className}>
      <table
        className={cn(
          'mx-5 w-184 border-separate border-spacing-0 md:mx-0 md:w-full',
          isFilled && 'overflow-hidden rounded-lg border border-border bg-primary-foreground',
        )}
      >
        {type === 'withTopHeader' && (
          <thead>
            <tr>
              {tableHead?.[0].cells.map((item, index) => (
                <th
                  className={cn(
                    defaultCellStyles,
                    'min-w-36 pb-3 leading-snug font-medium',
                    !isFilled && 'border-b border-border pt-0',
                    isFilled && 'border-r border-foreground/10 bg-secondary px-5 pt-3',
                    isFilled && index === 0 && 'pl-4',
                    isFilled && index === tableHead[0].cells.length - 1 && 'border-r-0 pr-4',
                  )}
                  key={index}
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {tableBoby.map(({ cells }, index) => (
            <tr key={index}>
              {cells.map((item, collIndex) => {
                return (
                  <td
                    className={cn(
                      defaultCellStyles,
                      'min-w-36 pr-10',
                      isFilled && 'border-r border-border px-4',
                      cells.length - 1 === collIndex && 'pr-0',
                      index < tableBoby.length - 1 && 'border-b border-border',
                      index === tableBoby.length - 1 && 'border-b-0',
                      isFilled && collIndex === 0 && 'pl-4',
                      isFilled && collIndex === cells.length - 1 && 'border-r-0 pr-4',
                      !isFilled && index === tableBoby.length - 1 ? 'pb-2' : 'pb-3',
                    )}
                    key={collIndex}
                  >
                    <CodeText text={item} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}
