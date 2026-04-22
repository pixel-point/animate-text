import Image from 'next/image';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export interface IPictureProps {
  className?: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  variant?: 'default' | 'outline';
}

const pictureVariants = cva('relative', {
  variants: {
    variant: {
      default: '',
      outline:
        'rounded-xl p-2 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-xl before:border before:border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const MANAGED_COVER_SRC_REGEX = /^\/images\/cover-\d+\.jpg(?:[?#].*)?$/;

function Picture({
  className,
  src,
  alt = '',
  caption,
  variant = 'default',
  width = 704,
  height = 400,
}: IPictureProps) {
  const shouldApplyManagedCoverStyle = MANAGED_COVER_SRC_REGEX.test(src);

  return (
    <figure className={cn('my-6 md:my-8', className)}>
      <div className={pictureVariants({ variant })}>
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
                }
              : undefined
          }
          quality={100}
          alt={alt}
        />
      </div>
      {caption && (
        <figcaption className="mx-auto mt-3 max-w-2xl text-center text-sm font-medium tracking-tight text-muted-foreground md:text-base">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default Picture;
