"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/useI18n";

const GUEST_OPACITIES = [0.12, 0.18, 0.25, 0.34];
const GUEST_MAX_BLOBS = 2;

type GuestBlob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
};

function RightNavGuestBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let time = 0;
    const cellSize = 10;

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

    let blobs: GuestBlob[] = [];

    const spawnBlob = (forceInside = false): GuestBlob => {
      const radius = Math.max(width, height) * (0.42 + random() * 0.18);
      let x = 0;
      let y = 0;

      if (forceInside) {
        x = width * (0.28 + random() * 0.44);
        y = height * (0.28 + random() * 0.44);
      } else {
        const side = Math.floor(random() * 4);
        if (side === 0) {
          x = -radius * 0.25;
          y = random() * height;
        } else if (side === 1) {
          x = width + radius * 0.25;
          y = random() * height;
        } else if (side === 2) {
          x = random() * width;
          y = -radius * 0.25;
        } else {
          x = random() * width;
          y = height + radius * 0.25;
        }
      }

      const targetX = width * (0.22 + random() * 0.56);
      const targetY = height * (0.22 + random() * 0.56);
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
      while (blobs.length < GUEST_MAX_BLOBS) {
        blobs.push(spawnBlob(blobs.length === 0));
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / cellSize) + 1;
      rows = Math.ceil(height / cellSize) + 1;
      blobs = [];
      ensureBlobs();
    };

    const isBlobStillRelevant = (blob: GuestBlob) => {
      const margin = blob.radius * 0.6;
      return (
        blob.x > -margin &&
        blob.x < width + margin &&
        blob.y > -margin &&
        blob.y < height + margin
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

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
          const px = x * cellSize;
          const py = y * cellSize;
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

              blobPower += roundShape * (1 + wave * 0.55);
            }
          }

          let opacityIndex = -1;
          if (blobPower > mathConfig.thresholdA) opacityIndex = 0;
          if (blobPower > mathConfig.thresholdB) opacityIndex = 1;
          if (blobPower > mathConfig.thresholdC) opacityIndex = 2;
          if (blobPower > mathConfig.thresholdD) opacityIndex = 3;

          if (opacityIndex >= 0) {
            hasVisiblePixels = true;
            ctx.fillStyle = `rgba(161, 161, 170, ${GUEST_OPACITIES[opacityIndex]})`;
            ctx.fillRect(px, py, cellSize, cellSize);
          }
        }
      }

      if (!hasVisiblePixels) {
        blobs = [spawnBlob(true), spawnBlob(false)];
      }

      time += 1;
      timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(draw);
      }, 70);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);

    resize();
    draw();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="h-full w-full opacity-90" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/25 to-black/75" />
    </div>
  );
}

export function RightNavGuestDisclaimer() {
  const { t } = useI18n();

  return (
    <div className="hidden md:flex md:sticky md:top-4 self-start md:w-20 lg:w-[244px] xl:w-72 h-full">
      <div className="relative overflow-hidden">
        <div className="relative min-h-32 rounded-xl border-t-2 border-primary-neutral-stroke-default/75 overflow-hidden">
          <RightNavGuestBackground />
          <div className="relative z-10 h-full p-3 flex flex-col justify-end">
            <p className="text-xs uppercase font-serif tracking-[0.16em] text-text-neutral/80">
              {t("right.guestEyebrow")}
            </p>
            <p className="text-sm font-semibold text-text-main font-sans">
              {t("right.guestCopy")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
