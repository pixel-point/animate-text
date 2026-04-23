import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export function AnimatedIcon({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [swingKey, setSwingKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 780);
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    if (!isPlaying) return;

    setIsPlaying(false);
    setSwingKey((k) => k + 1);

    setTimeout(() => {
      setIsPlaying(true);
    }, 780);
  };

  return (
    <svg
      key={swingKey}
      viewBox="0 0 162 183"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className || ''} animate-icon-swing`}
      onClick={handlePlay}
      style={{ cursor: 'pointer', border: '1px solid red', width: '200px', height: '200px' }}
    >
      <path
        d="M20 136C46.5 136 40.3691 37.002 60.2016 37.002C80.034 37.002 84.3794 107 99.249 107C114.119 107 117.5 37.002 141 37.002"
        stroke="black"
        strokeWidth="2"
      />
      <g style={{ transform: isPlaying ? 'none' : 'translate(43.33px, 82.25px)' }}>
        {isPlaying && (
          <animateMotion
            key="animation"
            ref={(el) => {
              const animation = el as (SVGElement & { beginElement?: () => void }) | null;

              if (animation) {
                try {
                  animation.beginElement?.();
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            dur="0.8s"
            path="M20 136C46.5 136 40.3691 37.002 60.2016 37.002C80.034 37.002 84.3794 107 99.249 107C114.119 107 117.5 37.002 141 37.002"
            calcMode="spline"
            keyTimes="0; 0.78; 0.781; 1"
            keyPoints="0.22; 1; 0; 0.22"
            keySplines="0.42 0 1 1; 0 0 1 1; 0 0 0.58 1"
            fill="freeze"
            begin="indefinite"
          />
        )}
        <circle cx="0" cy="0" r="9" fill="blue" />
      </g>
    </svg>
  );
}

const rootContainer = document.getElementById('root');

if (rootContainer) {
  const root = createRoot(rootContainer);
  root.render(<AnimatedIcon />);
}
