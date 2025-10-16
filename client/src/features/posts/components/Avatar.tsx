// src/features/posts/components/Avatar.tsx
import Image from "next/image";
import DefaultAvatar from "@/assets/defaultAvatar.svg"; // upewnij się, że SVG jest w folderze assets

const avatarClass =
  "w-10 h-10 rounded-xl border border-neutral-800 object-cover";

type AvatarProps = {
  src?: string;
  alt?: string;
};

export const Avatar = ({ src, alt }: AvatarProps) => {
  // jeśli podano src, użyj <Image>
  if (src) {
    return (
      <Image
        className={avatarClass}
        src={src}
        alt={alt ?? "User avatar"}
        width={40}
        height={40}
      />
    );
  }

  // fallback na domyślny SVG avatar
  return <DefaultAvatar className={avatarClass} />;
};
