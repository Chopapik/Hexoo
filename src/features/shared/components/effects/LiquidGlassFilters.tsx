import React from "react";

export default function LiquidGlassFilters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="absolute left-0 top-0 h-0 w-0"
      width="0"
      height="0"
    >
      <defs>
        <filter
          id="liquid-distortion"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves="3"
            seed="2"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="14s"
              values="0.012;0.02;0.012"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="baseFrequency"
              type="scale"
              values="1 1;1.15 0.95;1 1"
              dur="18s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" />
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
    </svg>
  );
}
