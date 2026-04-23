'use client';

import { ReactNode, useState } from 'react';
import { PlayIcon } from '@phosphor-icons/react/ssr';
import { cva } from 'class-variance-authority';

import { IYouTubeEmbed } from '@/types/common';
import { cn } from '@/lib/utils';

export interface IYouTubeEmbedProps extends IYouTubeEmbed {
  className?: string;
  children: ReactNode;
  width?: number;
  height?: number;
  variant?: 'default' | 'outline';
}

const youtubeVariants = cva('relative', {
  variants: {
    variant: {
      default: '',
      outline:
        'rounded-xl p-2 before:pointer-events-none before:absolute before:inset-0 before:z-40 before:rounded-xl before:border before:border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function YouTubeEmbed({
  children,
  youtubeId,
  width = 704,
  height = Math.ceil(704 / 1.7777777777777777),
  className,
  variant = 'default',
}: IYouTubeEmbedProps) {
  const [isVideoActive, setIsVideoActive] = useState(false);

  const handleVideoClick = () => {
    setIsVideoActive(true);
  };

  return (
    <figure
      className={cn(
        'youtube-embed not-prose relative flex',
        youtubeVariants({ variant }),
        className,
      )}
    >
      <button
        className={cn(
          'w-full overflow-hidden',
          variant === 'outline' && 'rounded-lg',
          variant === 'default' && 'rounded-xl',
        )}
        role="button"
        onClick={handleVideoClick}
      >
        <div className={cn('aspect-video size-full bg-background', isVideoActive && 'invisible')}>
          {children}
        </div>
        <div
          className="absolute top-4 left-4 flex h-8 items-center justify-center gap-x-2 rounded-full bg-background/90 px-3 text-xs font-semibold tracking-tight shadow-md lg:top-6 lg:left-6 lg:pr-4 lg:pl-3"
          tabIndex={isVideoActive ? -1 : 0}
        >
          <PlayIcon className="shrink-0" size={14} />
          <span className="sr-only sm:not-sr-only">Play video</span>
        </div>
      </button>
      {isVideoActive && (
        <div className={cn('absolute inset-0', variant === 'outline' && 'p-2')}>
          <iframe
            className={cn(
              'aspect-video size-full bg-background',
              variant === 'outline' && 'rounded-lg',
              variant === 'default' && 'rounded-xl',
            )}
            width={width}
            height={height}
            src={`https://www.youtube.com/embed/${youtubeId}?&autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
    </figure>
  );
}

export default YouTubeEmbed;
