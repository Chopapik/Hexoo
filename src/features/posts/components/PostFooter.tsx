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

  const activeTextColor = "text-primary-fuchsia-stroke-default";
  const inactiveTextColor = "text-text-neutral";

  return (
    <div className="w-full flex items-center gap-1">
      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
          user 
            ? "cursor-pointer hover:bg-primary-fuchsia-background-default/10" 
            : "cursor-not-allowed opacity-50"
        } ${post.isLikedByMe ? "bg-primary-fuchsia-background-default/15" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!user) return;
          toggleLike(post.id);
        }}
        disabled={!user}
      >
        <LikeIcon isLikedByMe={post.isLikedByMe} />
        <span
          className={`text-sm font-medium font-sans tabular-nums ${
            post.isLikedByMe ? activeTextColor : inactiveTextColor
          }`}
        >
          {post.likesCount}
        </span>
      </button>

      <button
        type="button"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer hover:bg-secondary-neutral-background-default/50 transition-all duration-200 group"
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick();
        }}
      >
        <div className="group-hover:text-text-main transition-colors">
          <CommentIcon />
        </div>
        <span className="text-text-neutral text-sm font-medium font-sans tabular-nums group-hover:text-text-main transition-colors">
          {post.commentsCount}
        </span>
      </button>
    </div>
  );
};
