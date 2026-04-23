'use client';

import { useEffect, useState } from 'react';

export function AnimatedIcon({ className }: { className?: string }) {
  const [playCount, setPlayCount] = useState(0);

  useEffect(() => {
    // Add a slight delay for initial load animation
    const timer = setTimeout(() => {
      setPlayCount(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    setPlayCount((c) => c + 1);
  };

  return (
    <svg
      viewBox="0 0 162 183"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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

      {/* Background grids/lines */}
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

      {/* The main bezier path */}
      <path
        d="M20 136C46.5 136 40.3691 37.002 60.2016 37.002C80.034 37.002 84.3794 107 99.249 107C114.119 107 117.5 37.002 141 37.002"
        stroke="black"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The animated circles group */}
      <g style={{ transform: playCount > 0 ? 'none' : 'translate(42px, 83px)' }}>
        {playCount > 0 && (
          <animateMotion
            key={playCount}
            ref={(el) => {
              if (el) {
                try {
                  el.beginElement();
                } catch (e) {}
              }
            }}
            dur="1s"
            path="M20 136C46.5 136 40.3691 37.002 60.2016 37.002C80.034 37.002 84.3794 107 99.249 107C114.119 107 117.5 37.002 141 37.002"
            calcMode="spline"
            keyTimes="0; 0.78; 0.781; 1"
            keyPoints="0.22; 1; 0; 0.22"
            keySplines="0.42 0 1 1; 0 0 1 1; 0 0 0.58 1"
            fill="freeze"
            begin="indefinite"
          />
        )}
        <g filter="url(#filter0_d_10565_72705)">
          <circle cx="0" cy="0" r="13" fill="white" />
        </g>
        <circle cx="0" cy="0" r="9" fill="#007DE3" />
      </g>

      <defs>
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
