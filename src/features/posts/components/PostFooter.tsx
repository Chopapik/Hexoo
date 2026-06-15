"use client";

import type { PublicPostResponseDto } from "../types/post.dto";
import { CommentIcon } from "../icons/CommentIcon";
import { LikeIcon } from "../icons/LikeIcon";
import { useToggleLike } from "../hooks/useToggleLike";
import { useAppStore } from "@/lib/store/store";

type PostFooterProps = {
  post: PublicPostResponseDto;
  onCommentClick: () => void;
};

export const PostFooter = ({ post, onCommentClick }: PostFooterProps) => {
  const { toggleLike } = useToggleLike();
  const user = useAppStore((s) => s.auth.user);

  const activeTextColor = "text-accent-fuchsia-border-default";
  const inactiveTextColor = "text-foreground-secondary-default";

  return (
    <div className="inline-flex h-5 w-full items-start justify-start gap-4 bg-transparent">
      <div
        className={`flex justify-start items-center gap-1.5 group ${
          user ? "cursor-pointer" : "cursor-not-allowed opacity-70"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (!user) return;
          toggleLike(post.id);
        }}
      >
        <div className="p-1 -m-1 flex items-center justify-center">
          <LikeIcon isLikedByMe={post.isLikedByMe} />
        </div>
        <div
          className={`justify-start font-sans text-xs font-semibold leading-5 md:text-sm ${
            post.isLikedByMe ? activeTextColor : inactiveTextColor
          }`}
        >
          {post.likesCount}
        </div>
      </div>

      <div
        className="flex justify-start items-center gap-1.5 cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick();
        }}
      >
        <div
          data-svg-wrapper
          className="group-hover:text-foreground-primary-default transition-colors"
        >
          <CommentIcon />
        </div>
        <div className="justify-start font-sans text-xs font-semibold leading-5 text-foreground-secondary-default transition-colors group-hover:text-foreground-primary-default md:text-sm">
          {post.commentsCount}
        </div>
      </div>
    </div>
  );
};
