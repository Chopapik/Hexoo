"use client";

import React, { useEffect, useRef } from "react";

const GEOMETRY_OPACITIES = [0.06, 0.12, 0.18, 0.25];
const MAX_BLOBS = 2;

type AnimationBlob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
};

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    let time = 0;

    let squareSize = 16;
    let cols = 0;
    let rows = 0;
    let cssWidth = 0;
    let cssHeight = 0;

    let blobs: AnimationBlob[] = [];

    const random = () => Math.random() + Math.random() * 0.54;

    const mathConfig = {
      xWave: 0.1 + random() * 0.05,
      yWave: 0.1 + random() * 0.05,
      diagonalWave: 0.04 + random() * 0.04,

      xSpeed: 0.008 + random() * 0.006,
      ySpeed: 0.008 + random() * 0.006,
      diagonalSpeed: 0.006 + random() * 0.004,

      waveStrengthA: 0.04 + random() * 0.035,
      waveStrengthB: 0.04 + random() * 0.035,
      waveStrengthC: 0.025 + random() * 0.025,

      thresholdA: 0.07 + random() * 0.025,
      thresholdB: 0.14 + random() * 0.035,
      thresholdC: 0.24 + random() * 0.04,
      thresholdD: 0.36 + random() * 0.05,
    };

    const spawnBlob = (forceInside = false): AnimationBlob => {
      const radius = Math.max(cssWidth, cssHeight) * (0.42 + random() * 0.18);

      let x: number;
      let y: number;

      if (forceInside) {
        x = cssWidth * (0.28 + random() * 0.44);
        y = cssHeight * (0.28 + random() * 0.44);
      } else {
        const side = Math.floor(random() * 4);

        if (side === 0) {
          x = -radius * 0.25;
          y = random() * cssHeight;
        } else if (side === 1) {
          x = cssWidth + radius * 0.25;
          y = random() * cssHeight;
        } else if (side === 2) {
          x = random() * cssWidth;
          y = -radius * 0.25;
        } else {
          x = random() * cssWidth;
          y = cssHeight + radius * 0.25;
        }
      }

      const targetX = cssWidth * (0.22 + random() * 0.56);
      const targetY = cssHeight * (0.22 + random() * 0.56);

      const dx = targetX - x;
      const dy = targetY - y;
      const length = Math.hypot(dx, dy) || 1;

      const speed = 0.14 + random() * 0.14;

      return {
        x,
        y,
        vx: (dx / length) * speed,
        vy: (dy / length) * speed,
        radius,
        phase: random() * Math.PI * 2,
      };
    };

    const ensureBlobs = () => {
      while (blobs.length < MAX_BLOBS) {
        blobs.push(spawnBlob(blobs.length === 0));
      }
    };

    const resizeCanvas = () => {
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;

      const dpr = window.devicePixelRatio || 1;

      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;

      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      squareSize = 16;
      cols = Math.ceil(cssWidth / squareSize) + 1;
      rows = Math.ceil(cssHeight / squareSize) + 1;

      blobs = [];
      ensureBlobs();
    };

    const isBlobStillRelevant = (blob: AnimationBlob) => {
      const margin = blob.radius * 0.6;

      return (
        blob.x > -margin &&
        blob.x < cssWidth + margin &&
        blob.y > -margin &&
        blob.y < cssHeight + margin
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      blobs = blobs
        .map((blob) => ({
          ...blob,
          x: blob.x + blob.vx,
          y: blob.y + blob.vy,
        }))
        .filter(isBlobStillRelevant);

      ensureBlobs();

      let hasVisiblePixels = false;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * squareSize;
          const py = y * squareSize;

          let blobPower = 0;

          for (const blob of blobs) {
            const dx = px - blob.x;
            const dy = py - blob.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const distanceFromCenter = distance / blob.radius;

            if (distanceFromCenter < 1) {
              const circle = 1 - distanceFromCenter;

              const roundShape = Math.pow(circle, 1.75);

              const wave =
                Math.sin(
                  x * mathConfig.xWave + time * mathConfig.xSpeed + blob.phase,
                ) *
                  mathConfig.waveStrengthA +
                Math.cos(
                  y * mathConfig.yWave - time * mathConfig.ySpeed + blob.phase,
                ) *
                  mathConfig.waveStrengthB +
                Math.sin(
                  (x + y) * mathConfig.diagonalWave +
                    time * mathConfig.diagonalSpeed,
                ) *
                  mathConfig.waveStrengthC;

              const softEdge = roundShape * (1 + wave * 0.55);

              blobPower += softEdge;
            }
          }

          let opacityIndex = -1;

          if (blobPower > mathConfig.thresholdA) opacityIndex = 0;
          if (blobPower > mathConfig.thresholdB) opacityIndex = 1;
          if (blobPower > mathConfig.thresholdC) opacityIndex = 2;
          if (blobPower > mathConfig.thresholdD) opacityIndex = 3;

          if (opacityIndex >= 0) {
            hasVisiblePixels = true;

            ctx.fillStyle = `rgba(219, 56, 240, ${GEOMETRY_OPACITIES[opacityIndex]})`;
            ctx.fillRect(px, py, squareSize, squareSize);
          }
        }
      }

      if (!hasVisiblePixels) {
        blobs = [spawnBlob(true), spawnBlob(false)];
      }

      time += 1;

      timeoutId = setTimeout(() => {
        animationFrameId = requestAnimationFrame(draw);
      }, 65);
    };

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full opacity-50" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.95)_100%)]" />
    </div>
  );
}
