import { cva } from 'class-variance-authority';

import { type IAuthor, type IBlockquote } from '@/types/common';
import { cn, getFormattedAuthorsName } from '@/lib/utils';
import StackedAvatars from '@/components/pages/stacked-avatars';

export interface IBlockquoteProps extends IBlockquote {
  className?: string;
  theme?: 'border' | 'quote';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  centered?: boolean;
}

const blockquoteVariants = cva('blockquote not-prose flex flex-col', {
  variants: {
    variant: {
      border: 'border-l-2 border-foreground py-px pl-4 md:pl-6',
      quote: '',
    },
  },
  defaultVariants: {
    variant: 'quote',
  },
});

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-8', className)}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_9031_187)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.14789 6.08983C3.52316 4.75174 5.38843 4 7.33336 4C9.27758 4.00223 11.1415 4.75468 12.5163 6.0923C13.8911 7.42991 14.6644 9.24346 14.6667 11.1351C14.6667 18.5498 10.5787 24.2891 7.15002 27.7983C7.08773 27.862 7.01276 27.9128 6.92966 27.9475C6.84657 27.9821 6.7571 28 6.66669 28H5.33335C5.21435 28 5.09751 27.969 4.99498 27.9102C4.89244 27.8515 4.80794 27.7671 4.75025 27.6658C4.69256 27.5645 4.66379 27.4501 4.66691 27.3343C4.67003 27.2186 4.70494 27.1058 4.76801 27.0076C6.50387 24.3592 7.59517 21.3602 7.95869 18.2391C7.75202 18.2566 7.54469 18.2703 7.33336 18.2703C5.38843 18.2703 3.52316 17.5185 2.14789 16.1804C0.772619 14.8423 0 13.0275 0 11.1351C0 9.24278 0.772619 7.42793 2.14789 6.08983ZM19.4812 6.08983C20.8564 4.75174 22.7217 4 24.6666 4C26.6109 4.00223 28.4748 4.75468 29.8496 6.0923C31.2243 7.42991 31.9977 9.24346 32 11.1351C32 18.5498 27.912 24.2891 24.4833 27.7983C24.421 27.862 24.346 27.9128 24.2629 27.9475C24.1799 27.9821 24.0904 28 24 28H22.6666C22.5476 28 22.4308 27.969 22.3283 27.9102C22.2257 27.8515 22.1412 27.7671 22.0835 27.6658C22.0258 27.5645 21.9971 27.4501 22.0002 27.3343C22.0033 27.2186 22.0382 27.1058 22.1013 27.0076C23.8371 24.3592 24.9284 21.3602 25.292 18.2391C25.0853 18.2566 24.878 18.2703 24.6666 18.2703C22.7217 18.2703 20.8564 17.5185 19.4812 16.1804C18.1059 14.8423 17.3333 13.0275 17.3333 11.1351C17.3333 9.24278 18.1059 7.42793 19.4812 6.08983Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_9031_187">
          <rect width="32" height="32" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
}

function Blockquote({
  quote,
  authors,
  role,
  className,
  theme,
  size = 'md',
  centered = false,
}: IBlockquoteProps) {
  const isThemeQuote = theme === 'quote';

  const authorsArray = Array.isArray(authors) ? authors : [authors];
  const avatars = authorsArray
    ?.filter((author): author is IAuthor => !!author)
    .reduce((acc, author) => {
      if (author.photo) acc.push(author.photo);
      return acc;
    }, [] as string[])
    .filter(Boolean);
  const names = authorsArray
    ?.filter((author): author is IAuthor => !!author)
    .map((author) => author.name || '');

  return (
    <figure
      className={cn(
        blockquoteVariants({ variant: theme }),
        centered && 'md:mx-auto md:items-center md:text-center',
        className,
      )}
    >
      {isThemeQuote && (
        <QuoteIcon className="size-7 rotate-180 text-muted-foreground md:size-8" aria-hidden />
      )}
      <blockquote className={cn(isThemeQuote && 'mt-3.5', isThemeQuote && !centered && 'md:pl-8')}>
        <p className="text-lg leading-snug font-medium tracking-tight text-pretty md:text-2xl md:leading-normal">
          {quote}
        </p>
      </blockquote>
      {((authorsArray && authorsArray.length > 0) || role) && (
        <figcaption
          className={cn(
            'mt-5 md:mt-3.5 md:line-clamp-1 md:flex md:items-center',
            size === 'xs' ? 'text-[0.8125rem]' : 'text-sm leading-none',
            isThemeQuote && !centered && 'md:pl-8',
          )}
        >
          {authorsArray && authorsArray.length > 0 && (
            <>
              <StackedAvatars
                className="hidden md:flex"
                avatars={avatars}
                names={names}
                size={size}
              />
              <div
                className={cn(
                  'inline md:line-clamp-1',
                  avatars.length > 0 && size === 'xs' && 'md:ml-2.5',
                  avatars.length > 0 && size !== 'xs' && 'md:ml-3',
                )}
              >
                {names?.map((name, index) => (
                  <span
                    className={cn(
                      'leading-tight font-medium tracking-tight text-secondary-foreground',
                      index < names.length - 1 ? 'mr-px' : 'mr-1.5',
                    )}
                    key={index}
                  >
                    {names?.length > 1 ? getFormattedAuthorsName(name || '') : name}
                    {index !== names?.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </>
          )}
          {role && (
            <>
              <span className="inline leading-tight tracking-tight text-muted-foreground md:line-clamp-1">
                {names?.length > 0 && <span className="mr-2">—</span>}
                {role}
              </span>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export default Blockquote;
