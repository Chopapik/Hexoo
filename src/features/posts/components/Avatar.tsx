import React from "react";
import Image from "next/image";
import defaultAvatarUrl from "@/features/shared/assets/defaultAvatar.svg?url";
const avatarClass =
  "w-10 h-10 rounded-xl border border-neutral-800 object-cover";

type AvatarProps = {
  src?: string;
  alt?: string;
};

export const Avatar = ({ src, alt }: AvatarProps) => {
  return (
    <Image
      className={avatarClass}
      src={src ?? defaultAvatarUrl}
      alt={alt ?? "User avatar"}
      width={40}
      height={40}
    />
  );
};
