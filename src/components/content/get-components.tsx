import {
  Children,
  cloneElement,
  ComponentProps,
  CSSProperties,
  Fragment,
  HTMLAttributes,
  ImgHTMLAttributes,
  isValidElement,
  PropsWithChildren,
} from 'react';
import Image from 'next/image';

import { type IAuthorData, type IBlockquote, type ISlug, type TTableTheme } from '@/types/common';
import {
  type IContentRelatedPosts,
  type IContentVideo,
  type IContentYouTube,
} from '@/types/content';
import { cn, extractTextFromChildren, extractYouTubeId, generateHeadingSlug } from '@/lib/utils';
import { Accordion, AccordionItem } from '@/components/content/accordion';
import Admonition from '@/components/content/admonition';
import Blockquote from '@/components/content/blockquote';
import Card from '@/components/content/card';
import CodeBlock from '@/components/content/code-block';
import CodeTabs, { ICodeTabsProps } from '@/components/content/code-tabs';
import Details from '@/components/content/details';
import FileSystem from '@/components/content/file-system';
import { Col, Grid } from '@/components/content/grid';
import Heading from '@/components/content/heading';
import Picture, { IPictureProps } from '@/components/content/picture';
import {
  RelatedLinkCard,
  RelatedPostCard,
  RelatedPosts,
  type IRelatedPostCard,
} from '@/components/content/related-posts';
import { Step, Steps } from '@/components/content/steps';
import { TableWrapper } from '@/components/content/table';
import { Tab, Tabs, type TabsProps } from '@/components/content/tabs';
import Video from '@/components/content/video';
import YouTubeEmbed from '@/components/content/youtube-embed';

interface IGetComponentsOptions {
  allowMediaBreakout?: boolean;
  contentWidth?: number;

  relatedPosts?: Array<{
    slug: ISlug;
    title: string;
    authors: IAuthorData[];
    publishedAt: string;
    pathname: string;
  }>;
}

const MANAGED_COVER_SRC_REGEX = /^\/images\/cover-\d+\.jpg(?:[?#].*)?$/;

export const getComponents = (options: IGetComponentsOptions) => {
  const headingIdMap: Record<string, number> = {};

  const { allowMediaBreakout = false, contentWidth = 704, relatedPosts = [] } = options;

  return {
    h2: ({ id, children }: ComponentProps<'h2'>) => {
      return (
        <Heading tag="h2" id={id}>
          {children}
        </Heading>
      );
    },
    h3: ({ id, children }: ComponentProps<'h3'>) => {
      return (
        <Heading tag="h3" id={id}>
          {children}
        </Heading>
      );
    },
    table: (props: HTMLAttributes<HTMLTableElement> & { theme?: TTableTheme }) => {
      const { theme, ...otherProps } = props;
      return (
        <TableWrapper
          className={cn(
            'custom-table not-prose',
            theme === 'filled' && 'theme-filled',
            theme === 'outline' && 'theme-outline',
          )}
        >
          <table {...otherProps} />
        </TableWrapper>
      );
    },
    ThemedTable: ({
      theme = 'outline',
      children,
      ...props
    }: PropsWithChildren<{ theme?: TTableTheme } & HTMLAttributes<HTMLDivElement>>) => {
      const childrenWithTheme = Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            theme,
            ...props,
          } as HTMLAttributes<HTMLElement>);
        }
        return child;
      });

      return childrenWithTheme;
    },
    pre: ({
      children,
      className,
      fileName,
      ...props
    }: PropsWithChildren<{
      className?: string;
      fileName?: string;
    }>) => {
      if (!isValidElement(children)) return null;

      return (
        <CodeBlock fileName={fileName}>
          <pre className={className} {...props}>
            {children}
          </pre>
        </CodeBlock>
      );
    },
    undefined: (props: ComponentProps<typeof Fragment>) => <Fragment {...props} />,
    img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
      if (!props.src) return null;

      const src = String(props.src);
      const width = props?.width ? Number(props.width) : contentWidth;
      const height = props?.height ? Number(props.height) : 400;
      const shouldApplyManagedCoverStyle = MANAGED_COVER_SRC_REGEX.test(src);

      return (
        <Image
          className="w-full rounded-lg"
          src={src}
          width={width}
          height={height}
          style={
            shouldApplyManagedCoverStyle
              ? {
                  aspectRatio: `${width} / ${height}`,
                  objectFit: 'cover',
                  ...(props.style as CSSProperties | undefined),
                }
              : (props.style as CSSProperties | undefined)
          }
          sizes={`(max-width: 768px) 100vw, ${width}px`}
          quality={100}
          alt={props?.alt || ''}
        />
      );
    },
    blockquote: (props: PropsWithChildren) => {
      return <blockquote {...props}>{props.children}</blockquote>;
    },
    Blockquote: (props: PropsWithChildren<IBlockquote & { className?: string }>) => {
      return (
        <Blockquote className={cn('my-6 md:my-8', props.className)} theme="border" {...props} />
      );
    },
    Video: ({ ...props }: PropsWithChildren<IContentVideo>) => {
      const { variant = 'default', ...otherProps } = props;
      const baseWidth = otherProps?.width ? Number(otherProps.width) : contentWidth;
      const canAllowMediaBreakout =
        allowMediaBreakout && (baseWidth === contentWidth || baseWidth === contentWidth + 128);
      const outlineAdjustment = variant === 'outline' ? -16 : 0;
      const mediaBreakoutAdjustment = canAllowMediaBreakout && baseWidth === contentWidth ? 128 : 0;
      const width = baseWidth + outlineAdjustment + mediaBreakoutAdjustment;
      const height = props?.height ? Number(props.height) : Math.min(400, (width * 16) / 9);

      return (
        <Video
          className={cn(canAllowMediaBreakout && 'lg:-mx-16')}
          controls
          {...props}
          width={width}
          height={height}
        />
      );
    },
    Picture: ({ className, ...props }: PropsWithChildren<IPictureProps>) => {
      const { variant = 'default', ...otherProps } = props;

      const baseWidth = otherProps?.width ? Number(otherProps.width) : contentWidth;
      const canAllowMediaBreakout =
        allowMediaBreakout && (baseWidth === contentWidth || baseWidth === contentWidth + 128);
      const outlineAdjustment = variant === 'outline' ? -16 : 0;
      const mediaBreakoutAdjustment = canAllowMediaBreakout && baseWidth === contentWidth ? 128 : 0;
      const width = baseWidth + outlineAdjustment + mediaBreakoutAdjustment;
      const height = otherProps?.height ? Number(otherProps.height) : 400;

      return (
        <Picture
          {...otherProps}
          className={cn('my-6 md:my-8', canAllowMediaBreakout && 'lg:-mx-16', className)}
          variant={variant}
          width={width}
          height={height}
        />
      );
    },
    YouTubeVideo: ({
      youtubeId,
      cover,
      className,
      variant = 'default',
    }: IContentYouTube & {
      className?: string;
      variant?: 'default' | 'outline';
    }) => {
      const id = extractYouTubeId(youtubeId);
      const previewCover = String(cover ?? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`);

      if (!id) {
        return null;
      }

      const outlineAdjustment = variant === 'outline' ? -16 : 0;
      const mediaBreakoutAdjustment = allowMediaBreakout ? 128 : 0;
      const width = contentWidth + outlineAdjustment + mediaBreakoutAdjustment;
      const height = Math.ceil((width / 16) * 9);

      return (
        <YouTubeEmbed
          className={cn('my-6 rounded-lg md:my-8', allowMediaBreakout && 'lg:-mx-16', className)}
          youtubeId={id}
          width={width}
          height={height}
          variant={variant}
        >
          <Image
            className="w-full rounded-[inherit]"
            src={previewCover}
            alt=""
            width={width}
            height={height}
          />
        </YouTubeEmbed>
      );
    },
    RelatedPosts: ({ title, children }: PropsWithChildren<IContentRelatedPosts>) => {
      const titleId = title
        ? generateHeadingSlug(extractTextFromChildren(title), headingIdMap)
        : undefined;

      return (
        <RelatedPosts
          className={cn('my-8', title && 'mt-11 md:mt-14')}
          titleId={titleId}
          title={title}
        >
          {children}
        </RelatedPosts>
      );
    },
    RelatedPostCard: ({ slug, ...props }: { slug: string } & IRelatedPostCard) => {
      const post = relatedPosts.find((post) => post.slug.current === slug);
      if (!post) return null;
      return <RelatedPostCard {...post} {...props} />;
    },
    RelatedLinkCard,
    Accordion,
    AccordionItem,
    Admonition,
    Card,
    Col,
    CodeBlock,
    CodeTabs: (props: PropsWithChildren<ICodeTabsProps>) => (
      <CodeTabs {...props} className={cn('my-6 md:my-8', props.className)} />
    ),
    Details,
    Grid,
    Steps,
    Step,
    Tabs: (props: PropsWithChildren<TabsProps>) => (
      <Tabs {...props} className={cn('my-6 md:my-8', props.className)} />
    ),
    Tab,
    FileSystem,
  };
};
