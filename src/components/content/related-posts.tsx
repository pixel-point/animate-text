import NextLink from 'next/link';

import { type IAuthorData } from '@/types/common';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/content/heading';
import Authors from '@/components/pages/authors';
import Date from '@/components/pages/date';

export interface IRelatedPostCard {
  className?: string;

  authors: IAuthorData[];
  publishedAt: string;
  title: string;
  pathname: string;
}

function RelatedPostCard({ className, authors, publishedAt, title, pathname }: IRelatedPostCard) {
  return (
    <NextLink
      className={cn(
        'group flex flex-col px-4 pt-4 pb-3.5 transition-colors duration-300 hover:bg-muted/50',
        className,
      )}
      href={pathname}
    >
      <article className="flex flex-row justify-between gap-x-5">
        <header className="flex flex-col gap-y-2.5">
          <Date publishedAt={publishedAt} />
          <h1 className="line-clamp-3 text-base leading-tight font-medium tracking-tight text-pretty text-foreground md:line-clamp-1 md:text-xl md:leading-snug">
            {title}
          </h1>
        </header>
        <Authors
          className="shrink-0 [&_img]:size-7 md:[&_img]:size-8"
          authors={authors}
          showNames={false}
        />
      </article>
    </NextLink>
  );
}

interface IRelatedLinkCardProps {
  className?: string;
  title: string;
  label: string;
  url: string;
  isExternal?: boolean;
}

function RelatedLinkCard({
  className,
  title,
  label,
  url,
  isExternal = false,
}: IRelatedLinkCardProps) {
  const isAbsoluteUrl = url.match(/^https?:\/\//) !== null;

  const isExternalLink = isExternal || isAbsoluteUrl;

  const badgeLabel = label ? label : isExternal ? 'External' : '';

  return (
    <NextLink
      className={cn(
        'flex flex-col p-4 transition-colors duration-300 hover:bg-muted/50',
        className,
      )}
      href={url}
      target={isExternalLink ? '_blank' : undefined}
      rel={isExternalLink ? 'noopener noreferrer' : undefined}
    >
      <div className="flex flex-row items-center justify-between gap-x-5">
        <div className="flex flex-col gap-y-1.5">
          <span className="flex text-sm leading-none font-medium tracking-tight whitespace-nowrap text-muted-foreground">
            {label}
          </span>
          <h3 className="line-clamp-3 text-base leading-tight font-medium tracking-tight text-balance text-foreground md:line-clamp-1 md:text-xl md:leading-snug">
            {title}
          </h3>
        </div>
        <Badge className="h-6" variant="filled" size="md">
          {badgeLabel}
        </Badge>
      </div>
    </NextLink>
  );
}

interface IRelatedPostsProps {
  className?: string;
  title?: string;
  titleId?: string;
  children: React.ReactNode;
}

function RelatedPosts({ className, title, titleId, children }: IRelatedPostsProps) {
  return (
    <figure className={cn('not-prose related-posts flex flex-col', className)}>
      {title && (
        <Heading
          className="mb-8 text-2xl leading-tight font-semibold tracking-tight md:text-3xl md:leading-tight"
          id={titleId}
          tag="h2"
        >
          {title}
        </Heading>
      )}
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-[var(--radius-lg)] border border-border">
        {children}
      </div>
    </figure>
  );
}

export { RelatedPosts, RelatedPostCard, RelatedLinkCard };
