import React from "react";
import type { PublicPostResponseDto } from "../types/post.dto";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import "dayjs/locale/pl";
import PostOptions from "./PostOptions";
import Link from "next/link";
import { formatSmartDate } from "@/features/shared/utils/dateUtils";

type PostMetaProps = {
  post: PublicPostResponseDto;
};

export const PostMeta = ({ post }: PostMetaProps) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <header className="w-full flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div onClick={handleLinkClick} className="relative">
          <Link href={`/profile/${post.userId}`}>
            <Avatar
              src={post.userAvatarUrl ?? undefined}
              alt={post.userName ?? undefined}
              className="size-10 sm:size-11 ring-2 ring-primary-neutral-stroke-default/50 hover:ring-primary-fuchsia-stroke-default/50 transition-all duration-200"
            />
          </Link>
        </div>
        <div className="flex flex-col justify-center">
          <div onClick={handleLinkClick}>
            <Link
              href={`/profile/${post.userId}`}
              className="text-text-main text-sm sm:text-base font-semibold font-sans hover:text-primary-fuchsia-stroke-default transition-colors duration-200"
            >
              {post.userName}
            </Link>
          </div>
          <time className="text-text-neutral text-xs font-normal font-sans tracking-wide">
            {formatSmartDate(post.createdAt)}
          </time>
        </div>
      </div>

      <div onClick={handleLinkClick} className="opacity-60 hover:opacity-100 transition-opacity">
        <PostOptions postId={post.id} authorId={post.userId} post={post} />
      </div>
    </header>
  );
};
