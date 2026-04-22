'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTouchDevice } from '@/hooks/use-touch-device';
import { Button } from '@/components/ui/button';

type SnapSliderProps = {
  orientation?: 'horizontal' | 'vertical';
};

type SnapSliderContextProps = {
  scrollableRef: { current: HTMLDivElement | null };
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & SnapSliderProps;

const SnapSliderContext = React.createContext<SnapSliderContextProps | null>(null);

function useSnapSlider() {
  const context = React.useContext(SnapSliderContext);

  if (!context) {
    throw new Error('useSnapSlider must be used within a <SnapSlider />');
  }

  return context;
}

const SnapSlider = ({
  orientation = 'horizontal',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & SnapSliderProps) => {
  const scrollableContentRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const scrollByOffset = React.useCallback(
    (offset: number) => {
      if (scrollableContentRef.current) {
        scrollableContentRef.current.scrollBy({
          left: orientation === 'horizontal' ? offset : 0,
          top: orientation === 'vertical' ? offset : 0,
          behavior: 'smooth',
        });
      }
    },
    [orientation],
  );

  const getScrollDimensionOfFirstItem = React.useCallback(() => {
    if (scrollableContentRef.current && scrollableContentRef.current.children.length > 0) {
      const firstItem = scrollableContentRef.current.children[0] as HTMLElement;
      const dim = orientation === 'horizontal' ? firstItem.offsetWidth : firstItem.offsetHeight;

      if (dim > 0) return dim;
      return 0;
    }
    return 0;
  }, [orientation]);

  const scrollPrev = React.useCallback(() => {
    const scrollDim = getScrollDimensionOfFirstItem();
    if (scrollDim > 0) {
      scrollByOffset(-scrollDim);
    }
  }, [scrollByOffset, getScrollDimensionOfFirstItem]);

  const scrollNext = React.useCallback(() => {
    const scrollDim = getScrollDimensionOfFirstItem();
    if (scrollDim > 0) {
      scrollByOffset(scrollDim);
    }
  }, [scrollByOffset, getScrollDimensionOfFirstItem]);

  React.useEffect(() => {
    const node = scrollableContentRef.current;
    if (!node) {
      return;
    }

    const getItemDimension = () => {
      if (node.children.length > 0) {
        const firstItem = node.children[0] as HTMLElement;
        const dim = orientation === 'horizontal' ? firstItem.offsetWidth : firstItem.offsetHeight;
        return dim > 0 ? dim : 0;
      }
      return 0;
    };

    const handleScrollStateChange = () => {
      if (!scrollableContentRef.current) return;

      const isHorizontal = orientation === 'horizontal';
      const itemDim = getItemDimension();

      const currentScroll = isHorizontal
        ? scrollableContentRef.current.scrollLeft
        : scrollableContentRef.current.scrollTop;
      const clientDimension = isHorizontal
        ? scrollableContentRef.current.clientWidth
        : scrollableContentRef.current.clientHeight;
      const scrollDimension = isHorizontal
        ? scrollableContentRef.current.scrollWidth
        : scrollableContentRef.current.scrollHeight;

      const roundedScroll = Math.round(currentScroll);
      const maxScroll = Math.max(0, Math.round(scrollDimension - clientDimension));

      if (itemDim > 0) {
        setCanScrollPrev(roundedScroll >= itemDim / 2);
      } else {
        setCanScrollPrev(roundedScroll > 0);
      }

      if (itemDim > 0) {
        setCanScrollNext(maxScroll - roundedScroll >= 20);
      } else {
        setCanScrollNext(roundedScroll < maxScroll);
      }
    };

    handleScrollStateChange();
    const timeoutId = setTimeout(handleScrollStateChange, 150);

    node.addEventListener('scroll', handleScrollStateChange, { passive: true });
    const resizeObserver = new ResizeObserver(handleScrollStateChange);
    resizeObserver.observe(node);

    const mutationObserver = new MutationObserver(handleScrollStateChange);
    mutationObserver.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      node.removeEventListener('scroll', handleScrollStateChange);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [orientation]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  return (
    <SnapSliderContext.Provider
      value={{
        scrollableRef: scrollableContentRef,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role="region"
        aria-roledescription="snap-slider"
        {...props}
      >
        {children}
      </div>
    </SnapSliderContext.Provider>
  );
};
SnapSlider.displayName = 'SnapSlider';

const SnapSliderContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { scrollableRef: contextScrollableRef, orientation } = useSnapSlider();

  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (contextScrollableRef) {
        contextScrollableRef.current = node;
      }
    },
    [contextScrollableRef],
  );

  return (
    <div
      ref={combinedRef}
      className={cn(
        'flex gap-5',
        orientation === 'horizontal'
          ? 'snap-x snap-mandatory overflow-x-scroll'
          : 'snap-y snap-mandatory flex-col overflow-y-scroll',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
SnapSliderContent.displayName = 'SnapSliderContent';

type SnapSliderItemProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};

const SnapSliderItem = ({ className, asChild, ...props }: SnapSliderItemProps) => {
  const { orientation } = useSnapSlider();
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={cn(
        'shrink-0',
        orientation === 'horizontal' ? 'snap-start' : 'snap-start',
        className,
      )}
      role="group"
      aria-roledescription="slide"
      {...props}
    />
  );
};
SnapSliderItem.displayName = 'SnapSliderItem';

const SnapSliderPrevious = ({
  className,
  variant = 'default',
  size = 'icon',
  hideOnTouch = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  hideOnTouch?: boolean;
}) => {
  const { orientation, scrollPrev, canScrollPrev } = useSnapSlider();
  const isTouchDevice = useTouchDevice();

  if (hideOnTouch && isTouchDevice) {
    return null;
  }

  return (
    <Button
      className={cn(
        'absolute size-11 rounded-xl [&_svg]:size-5',
        orientation === 'horizontal'
          ? 'top-1/2 left-0 -translate-y-1/2'
          : 'top-0 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      variant={variant}
      size={size}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="size-5" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
};
SnapSliderPrevious.displayName = 'SnapSliderPrevious';

const SnapSliderNext = ({
  className,
  variant = 'default',
  size = 'icon',
  hideOnTouch = false,
  ...props
}: React.ComponentProps<typeof Button> & {
  hideOnTouch?: boolean;
}) => {
  const { orientation, scrollNext, canScrollNext } = useSnapSlider();
  const isTouchDevice = useTouchDevice();

  if (hideOnTouch && isTouchDevice) {
    return null;
  }

  return (
    <Button
      className={cn(
        'absolute size-11 rounded-xl [&_svg]:size-5',
        orientation === 'horizontal'
          ? 'top-1/2 right-0 -translate-y-1/2'
          : 'bottom-0 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      variant={variant}
      size={size}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="size-5" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
};
SnapSliderNext.displayName = 'SnapSliderNext';

export { SnapSlider, SnapSliderContent, SnapSliderItem, SnapSliderNext, SnapSliderPrevious };
