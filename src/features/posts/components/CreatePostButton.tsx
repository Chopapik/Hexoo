"use client";

import { useEffect, useRef } from "react";
import { ImageIcon, PenLine } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { useAppStore } from "@/lib/store/store";
import Button from "@/features/shared/components/ui/Button";

const GEOMETRY_OPACITIES = [0.04, 0.09, 0.14, 0.19];

type CreatePostButtonProps = {
  text?: string;
  showIcon?: boolean;
  className?: string;
  textClassName?: string;
};

export default function CreatePostButton({
  text,
  showIcon = true,
  className,
  textClassName,
}: CreatePostButtonProps) {
  const { t } = useI18n();
  const openCreatePostModal = useAppStore((state) => state.openCreatePostModal);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let squareSize = 8;
    let cols = 0;
    let rows = 0;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const cssWidth = parent.clientWidth;
        const cssHeight = parent.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = cssWidth * dpr;
        canvas.height = cssHeight * dpr;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        squareSize = 8;
        cols = Math.ceil(cssWidth / squareSize) + 1;
        rows = Math.ceil(cssHeight / squareSize) + 1;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const waveX = Math.sin(x * 0.04 + time * 0.0285);
          const waveY = Math.cos(y * 0.06 - time * 0.019);
          const tanGlitch = Math.tan((x - y) * 0.02 + time * 0.0095) * 0.25;

          const totalWave = waveX + waveY + tanGlitch;

          let opacityIndex = -1;
          if (totalWave > 0.4) opacityIndex = 0;
          if (totalWave > 0.8) opacityIndex = 1;
          if (totalWave > 1.2) opacityIndex = 2;
          if (totalWave > 1.8) opacityIndex = 3;

          if (opacityIndex >= 0) {
            ctx.fillStyle = `rgba(255, 12, 255, ${GEOMETRY_OPACITIES[opacityIndex]})`;
            ctx.fillRect(
              x * squareSize,
              y * squareSize,
              squareSize,
              squareSize,
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

  const buttonClassName = [
    "glass-card group relative flex h-16 w-full self-stretch items-center justify-center overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 hover:border-button-glass-card-border-hover md:h-20 md:px-6 md:py-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rowClassName = [
    "relative z-10 flex min-w-0 flex-1 items-center overflow-hidden",
    showIcon ? "justify-between" : "justify-center",
  ].join(" ");

  const labelClassName = [
    "min-w-0 shrink whitespace-nowrap font-serif text-base xs:text-lg leading-normal text-foreground-primary-default md:overflow-visible md:text-xl font-semibold md:leading-[1.9]",
    textClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={buttonClassName}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700"
      />

      <div className={rowClassName}>
        <div className={labelClassName}>
          {text !== undefined ? text : t("post.createButton")}
        </div>
        {showIcon ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={openCreatePostModal}
              className="h-10 max-h-10 min-w-10 rounded-3xl border-[0.75px] px-0 py-[0.75px] lg:px-[16.75px]"
              leftIcon={
                <>
                  <span className="relative shrink-0 size-5" aria-hidden>
                    <ImageIcon
                      className="absolute inset-0 m-auto size-[18px]"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="sr-only lg:hidden">
                    {t("post.createImageAction")}
                  </span>
                  <span className="hidden whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.14px] lg:inline">
                    {t("post.createImageAction")}
                  </span>
                </>
              }
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={openCreatePostModal}
              className="h-10 max-h-10 min-w-10 px-0 py-[0.75px] lg:px-[16.75px]"
              leftIcon={
                <>
                  <span className="relative shrink-0 size-5" aria-hidden>
                    <PenLine
                      className="absolute inset-0 m-auto size-[14px]"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="sr-only lg:hidden">
                    {t("post.createTextAction")}
                  </span>
                  <span className="hidden whitespace-nowrap text-sm font-medium leading-5 tracking-[-0.14px] lg:inline">
                    {t("post.createTextAction")}
                  </span>
                </>
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
