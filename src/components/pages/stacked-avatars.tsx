import Image from 'next/image';

import { cn } from '@/lib/utils';

interface IAuthorsVariantsProps {
  avatars: string[];
  names?: string[];
  className?: string;
  priority?: boolean;
  size?: keyof typeof sizes;
}

const sizes = {
  xs: { className: 'size-7', width: 28, height: 28 },
  sm: { className: 'size-8', width: 32, height: 32 },
  md: { className: 'size-8 md:size-9', width: 36, height: 36 },
  lg: { className: 'size-8 md:size-10', width: 40, height: 40 },
} as const;

function StackedAvatars({
  className,
  avatars,
  names,
  priority = false,
  size = 'md',
}: IAuthorsVariantsProps) {
  if (avatars.length === 0) {
    return null;
  }

  const { className: imageClassName, width, height } = sizes[size] || sizes.md;

  if (avatars.length === 1) {
    return (
      <Image
        className={cn('shrink-0 rounded-full bg-muted', imageClassName, className)}
        src={avatars[0]}
        alt={names?.[0] ?? ''}
        width={width}
        height={height}
        loading={priority ? 'eager' : undefined}
        quality={100}
      />
    );
  }

  return (
    <div className={cn('flex shrink-0 items-center', className)}>
      {avatars.map((avatar, index) => (
        <Image
          className={cn(
            'relative shrink-0 rounded-full bg-muted',
            {
              '-ml-2.5': index > 0 && size === 'xs',
              '-ml-3': index > 0 && size === 'sm',
              '-ml-3 md:-ml-3.5': index > 0 && ['md', 'lg'].includes(size),
            },
            index < avatars.length - 1 &&
              'mask-[radial-gradient(circle_at_calc(100%+6px)_50%,transparent_50%,black_50%)]',
            {
              'md:mask-[radial-gradient(circle_at_calc(100%+8px)_50%,transparent_50%,black_50%)]':
                index < avatars.length - 1 && ['lg', 'xl'].includes(size),
            },
            imageClassName,
          )}
          key={index}
          src={avatar}
          alt={names?.[index] ?? ''}
          width={width}
          height={height}
          loading={priority ? 'eager' : undefined}
          quality={100}
        />
      ))}
    </div>
  );
}

export default StackedAvatars;
