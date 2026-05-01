"use client";

import React, { useEffect, useRef } from "react";

type CreatePostButtonProps = {
  onClick: () => void;
};

const ASCII_CHARS = [" ", "░", "▒", "▓", "█"];

export default function CreatePostButton({ onClick }: CreatePostButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const fontSize = 14;
    ctx.font = `bold ${fontSize}px monospace`;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 12, 255, 0.15)";

      const cols = Math.floor(canvas.width / (fontSize * 0.6));
      const rows = Math.floor(canvas.height / fontSize) + 1;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const waveX = Math.sin(x * 0.04 + time * 0.03);
          const waveY = Math.cos(y * 0.06 - time * 0.02);
          const tanGlitch = Math.tan((x - y) * 0.02 + time * 0.01) * 0.25;

          const totalWave = waveX + waveY + tanGlitch;

          let charIndex = 0;
          if (totalWave > 0.4) charIndex = 1;
          if (totalWave > 0.8) charIndex = 2;
          if (totalWave > 1.2) charIndex = 3;
          if (totalWave > 1.8) charIndex = 4;

          if (charIndex > 0) {
            ctx.fillText(
              ASCII_CHARS[charIndex],
              x * (fontSize * 0.6),
              y * fontSize + fontSize,
            );
          }
        }
      }

      time += 1;

      setTimeout(() => {
        animationFrameId = requestAnimationFrame(draw);
      }, 65);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      style={{
        background:
          "linear-gradient(to bottom right, rgba(255, 12, 255, 0.07) 0%, rgba(255, 255, 255, 0.01) 100%)",
      }}
      className="relative self-stretch h-20 glass-card px-8 py-4 w-full rounded-xl inline-flex justify-between items-center overflow-hidden cursor-pointer group hover:border-white/10 transition-all duration-300"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700"
      />

      <div className="relative z-10 w-full inline-flex justify-between items-center pointer-events-none">
        <div className="text-center justify-center text-text-main text-2xl font-semibold font-serif">
          co słychać?
        </div>
        <div data-svg-wrapper>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.40066 16.1601L16.7964 8.76441C15.5522 8.24465 14.4222 7.48565 13.4705 6.53049C12.5149 5.57857 11.7555 4.44821 11.2356 3.20361L3.83986 10.5993C3.26288 11.1763 2.97389 11.4653 2.7259 11.7833C2.4333 12.1588 2.18218 12.5648 1.97692 12.9943C1.80393 13.3582 1.67494 13.7462 1.41694 14.5202L0.0549935 18.6031C-0.00769048 18.79 -0.0169906 18.9907 0.0281383 19.1826C0.0732672 19.3746 0.171036 19.5501 0.310456 19.6895C0.449875 19.829 0.625418 19.9267 0.817353 19.9719C1.00929 20.017 1.21001 20.0077 1.39695 19.945L5.4798 18.5831C6.25477 18.3251 6.64176 18.1961 7.00574 18.0231C7.43706 17.8177 7.84071 17.5681 8.2167 17.2741C8.53469 17.0261 8.82368 16.7371 9.40066 16.1601ZM18.8483 6.71248C19.5857 5.97507 20 4.97493 20 3.93208C20 2.88923 19.5857 1.88909 18.8483 1.15168C18.1109 0.414271 17.1108 7.76985e-09 16.0679 0C15.0251 -7.76985e-09 14.0249 0.414271 13.2875 1.15168L12.4005 2.03865L12.4385 2.14964C12.8755 3.40038 13.5908 4.53555 14.5305 5.46952C15.4924 6.43731 16.6673 7.16671 17.9614 7.59945L18.8483 6.71248Z"
              fill="var(--text-main, white)"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
