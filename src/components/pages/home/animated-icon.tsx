'use client';

import { useEffect, useRef, useState } from 'react';

const MOTION_PATH =
  'M20 136C46.5 136 40.3691 37.002 60.2016 37.002C80.034 37.002 84.3794 107 99.249 107C114.119 107 117.5 37.002 141 37.002';
const INITIAL_TRANSLATE = 'translate(43.33px, 82.25px)';
const START_DELAY_MS = 780;
const FINISH_DELAY_MS = 1600;

type AnimateMotionHandle = SVGElement & {
  beginElement?: () => void;
};

export function AnimatedIcon({ className }: { className?: string }) {
  const [cycleKey, setCycleKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const animationRef = useRef<AnimateMotionHandle | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }

    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  const startAnimationCycle = () => {
    clearTimers();
    setIsPlaying(false);
    setIsAnimating(true);
    setCycleKey((key) => key + 1);

    startTimerRef.current = setTimeout(() => {
      setIsPlaying(true);
    }, START_DELAY_MS);

    finishTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, FINISH_DELAY_MS);
  };

  useEffect(() => {
    startAnimationCycle();

    return () => {
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    animationRef.current?.beginElement?.();
  }, [isPlaying, cycleKey]);

  const handlePlay = () => {
    if (isAnimating) {
      return;
    }

    startAnimationCycle();
  };

  return (
    <svg
      key={cycleKey}
      viewBox="0 0 162 183"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className || ''} animate-icon-swing`}
      onClick={handlePlay}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x="1.5"
        y="10.5"
        width="159"
        height="159"
        rx="47.5"
        fill="url(#paint0_linear_10565_72705)"
      />
      <rect
        x="1.5"
        y="10.5"
        width="159"
        height="159"
        rx="47.5"
        stroke="url(#paint1_linear_10565_72705)"
      />

      <g clipPath="url(#background-mask)">
        <path
          d="M1 36.5H161"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1 106.5H161"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M60 1L60 182"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 4"
        />
        <path
          d="M20 1L20 182"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 4"
        />
        <path
          d="M100 1L100 182"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 4"
        />
        <path
          d="M141 1L141 182"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 4"
        />
        <path
          d="M1 136.5H161"
          stroke="black"
          strokeOpacity="0.1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <path
        d={MOTION_PATH}
        stroke="black"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g style={{ transform: isPlaying ? 'none' : INITIAL_TRANSLATE }}>
        {isPlaying ? (
          <animateMotion
            key={cycleKey}
            ref={animationRef}
            dur="0.8s"
            path={MOTION_PATH}
            calcMode="spline"
            keyTimes="0; 0.78; 0.781; 1"
            keyPoints="0.22; 1; 0; 0.22"
            keySplines="0.42 0 1 1; 0 0 1 1; 0 0 0.58 1"
            fill="freeze"
            begin="indefinite"
          />
        ) : null}
        <g filter="url(#filter0_d_10565_72705)">
          <circle cx="0" cy="0" r="13" fill="white" />
        </g>
        <circle cx="0" cy="0" r="9" fill="#007DE3" />
      </g>

      <defs>
        <clipPath id="background-mask">
          <rect x="1.5" y="10.5" width="159" height="159" rx="47.5" />
        </clipPath>
        <filter
          id="filter0_d_10565_72705"
          x="-28"
          y="-24"
          width="56"
          height="56"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="7.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_10565_72705" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_10565_72705"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_10565_72705"
          x1="1"
          y1="10"
          x2="128"
          y2="161.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.456627" stopColor="white" />
          <stop offset="1" stopColor="#B3B3B3" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_10565_72705"
          x1="1"
          y1="10"
          x2="161"
          y2="170"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.223919" stopColor="#D4D4D4" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
