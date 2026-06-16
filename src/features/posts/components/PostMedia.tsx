"use client";

import { useEffect, useState } from "react";
import { DitheredImage } from "@/features/shared/components/media/DitheredImage";
import { useAppStore } from "@/lib/store/store";

type PostMediaProps = {
  src: string;
  alt: string;
  onReadyChange?: (isReady: boolean) => void;
};

export function PostMedia({ src, alt, onReadyChange }: PostMediaProps) {
  const dithering = useAppStore((s) => s.settings.postDithering);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();

    img.onload = () => {
      if (cancelled) return;
      setIsAnimated(src.toLowerCase().includes(".gif"));
    };

    img.onerror = () => {
      if (cancelled) return;
      setIsAnimated(src.toLowerCase().includes(".gif"));
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="relative h-[364px] w-full overflow-hidden rounded-xl bg-black md:h-[344px]">
      <div className="absolute left-[-83px] right-[-83px] top-1/2 aspect-[1066/556] -translate-y-1/2 blur-[32px]">
        <DitheredImage
          src={src}
          alt=""
          width={1066}
          height={556}
          sizes="(max-width: 768px) calc(100vw + 126px), 1104px"
          className="h-full w-full object-cover object-center"
          dithering={dithering}
          isAnimated={isAnimated}
        />
      </div>
      <div className="absolute left-[34px] right-[34px] top-1/2 aspect-[1066/556] -translate-y-1/2">
        <DitheredImage
          src={src}
          alt={alt}
          width={1066}
          height={556}
          sizes="(max-width: 768px) calc(100vw - 108px), 870px"
          className="h-full w-full object-cover object-center"
          dithering={dithering}
          isAnimated={isAnimated}
          onReadyChange={onReadyChange}
        />
      </div>
    </div>
  );
}
