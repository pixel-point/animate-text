import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

import { CarouselApi } from '@/components/ui/carousel';

interface UseSliderOptions {
  autoplay?: boolean;
  api?: CarouselApi | null;
}

export default function useSlider({ autoplay = false, api }: UseSliderOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(carouselRef, { amount: 0.3 });

  useEffect(() => {
    if (!autoplay) return;

    if (!inView) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [inView, autoplay]);

  const handleSlideChange = () => {
    if (api) {
      api.scrollNext();
    }
  };

  const handleSlideSelect = (index: number) => {
    if (api) {
      api.scrollTo(index);
      setActiveIndex(index);
    }
  };

  return {
    activeIndex,
    setActiveIndex,
    isPaused,
    setIsPaused,
    handleSlideChange,
    handleSlideSelect,
    carouselRef,
  };
}
