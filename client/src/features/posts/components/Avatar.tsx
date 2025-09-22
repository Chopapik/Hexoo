import DefaultAvatar from "@/assets/defaultAvatar.svg?react";

const avatarClass = "size-10 rounded-[10px] border border-neutral-800";

type AvatarProps = {
  src?: string;
  alt?: string;
};

export const Avatar = ({ src, alt }: AvatarProps) => {
  if (src) {
    return <img className={avatarClass} src={src} alt={alt ?? "User avatar"} />;
  }

  return <DefaultAvatar className={avatarClass} />;
};
