"use client";

import React, { useEffect, useRef } from "react";

const ASCII_CHARS = [" ", "░", "▒", "▓", "█"];

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const fontSize = 42;
    ctx.font = `bold ${fontSize}px monospace`;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(219, 56, 240, 0.25)";

      const cols = Math.floor(canvas.width / (fontSize * 0.6));
      const rows = Math.floor(canvas.height / fontSize) + 1;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const waveX = Math.sin(x * 0.08 + time * 0.005);
          const waveY = Math.cos(y * 0.1 - time * 0.005);
          const waveZ = Math.sin((x + y) * 0.05 + time * 0.003);

          const totalWave = waveX + waveY + waveZ;

          let charIndex = 0;
          if (totalWave > 1.2) charIndex = 1;
          if (totalWave > 1.6) charIndex = 2;
          if (totalWave > 2.0) charIndex = 3;
          if (totalWave > 2.4) charIndex = 4;

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
    <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full opacity-50" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.95)_100%)] pointer-events-none" />
    </div>
  );
}
