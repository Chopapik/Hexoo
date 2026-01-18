import React from "react";
import Image from "next/image";
import defaultAvatarUrl from "@/features/shared/assets/defaultAvatar.svg?url";
import { cn } from "@/features/shared/utils/utils";

const defaultClass =
  "w-10 h-10 rounded-xl border border-neutral-800 object-cover";

type AvatarProps = {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
};

export const Avatar = ({
  src,
  alt,
  className,
  width = 40,
  height = 40,
}: AvatarProps) => {
  return (
    <Image
      className={cn(defaultClass, className)}
      src={src || defaultAvatarUrl}
      alt={alt || "User avatar"}
      width={width}
      height={height}
    />
  );
};
