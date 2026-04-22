'use client';

import { useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import {
  Maximize,
  Minimize,
  PauseIcon,
  PlayIcon,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  MediaControlBar,
  MediaController,
  MediaDurationDisplay,
  MediaFullscreenButton,
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from 'media-chrome/react';
import { AnimatePresence, domAnimation, LazyMotion, useInView } from 'motion/react';
import * as m from 'motion/react-m';

import { IVideo } from '@/types/common';
import { cn } from '@/lib/utils';
import { useTouchDevice } from '@/hooks/use-touch-device';

interface IVideoProps extends IVideo {
  className?: string;
  variant?: 'default' | 'outline';
}

const videoVariants = cva('relative', {
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

const Video = ({
  className,
  src,
  alt,
  width,
  height,
  poster,
  autoplay,
  controls,
  muted,
  loop,
  variant = 'default',
}: IVideoProps) => {
  const [showControls, setShowControls] = useState(false);
  const figureRef = useRef<HTMLElement>(null);
  const isInView = useInView(figureRef, {
    margin: '250px 0px 250px 0px',
    once: true,
  });
  const isTouchDevice = useTouchDevice();

  return (
    <figure
      className={cn(
        'not-prose relative col-span-1 row-span-1 my-8 grid w-auto overflow-hidden rounded-lg bg-background',
        videoVariants({ variant }),
        className,
      )}
      ref={figureRef}
    >
      <svg
        className="relative col-span-full row-span-full w-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
      />
      {isInView && (
        <LazyMotion features={domAnimation}>
          <AnimatePresence>
            <m.div
              className={cn('relative col-span-full row-span-full flex w-full')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MediaController
                className={cn(
                  'overflow-hidden',
                  variant === 'outline' && 'rounded-lg',
                  variant === 'default' && 'rounded-xl',
                )}
                onMouseEnter={() => !isTouchDevice && setShowControls(true)}
                onMouseLeave={() => {
                  if (!isTouchDevice) setShowControls(false);
                }}
              >
                <video
                  className="my-0"
                  slot="media"
                  src={src}
                  width={width}
                  height={height}
                  preload="auto"
                  muted={autoplay ? true : muted}
                  crossOrigin=""
                  playsInline
                  loop={loop}
                  poster={poster}
                  autoPlay={autoplay}
                />
                {controls && (
                  <AnimatePresence>
                    {(isTouchDevice || showControls) && (
                      <m.div
                        className="absolute inset-x-0 bottom-0 px-4 pb-4 md:px-12"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MediaControlBar className="h-12 w-full overflow-hidden rounded-lg border border-border bg-popover px-1 shadow-[0_0.25rem_0.625rem_0rem_hsla(var(--background)/.2)] md:px-2.5">
                          <MediaPlayButton className="outline-hidden">
                            <span slot="play">
                              <PlayIcon className="size-4 md:size-5" />
                            </span>
                            <span slot="pause">
                              <PauseIcon className="size-4 md:size-5" />
                            </span>
                          </MediaPlayButton>
                          <MediaTimeDisplay className="min-w-10 px-0 tracking-tight outline-hidden md:min-w-12"></MediaTimeDisplay>
                          <MediaTimeRange className="px-1 outline-hidden md:px-2.5"></MediaTimeRange>
                          <MediaDurationDisplay className="min-w-12 px-0 tracking-tight outline-hidden" />
                          <MediaMuteButton className="px-1 outline-hidden md:px-2.5">
                            <span slot="low">
                              <Volume className="size-4 md:size-5" />
                            </span>
                            <span slot="medium">
                              <Volume1 className="size-4 md:size-5" />
                            </span>
                            <span slot="high">
                              <Volume2 className="size-4 md:size-5" />
                            </span>
                            <span slot="off">
                              <VolumeX className="size-4 md:size-5" />
                            </span>
                          </MediaMuteButton>
                          <MediaVolumeRange className="hidden max-w-[5.375rem] pr-1.5 outline-hidden sm:block"></MediaVolumeRange>
                          <MediaFullscreenButton className="outline-hidden">
                            <span slot="enter">
                              <Maximize className="size-4 md:size-5" />
                            </span>
                            <span slot="exit">
                              <Minimize className="size-4 md:size-5" />
                            </span>
                          </MediaFullscreenButton>
                        </MediaControlBar>
                      </m.div>
                    )}
                  </AnimatePresence>
                )}
              </MediaController>
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      )}
      {alt && <figcaption className="sr-only">{alt}</figcaption>}
    </figure>
  );
};

export default Video;
