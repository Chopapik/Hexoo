"use client";

import type { PublicPostResponseDto } from "../types/post.dto";
import { CommentIcon } from "../icons/CommentIcon";
import { LikeIcon } from "../icons/LikeIcon";
import { useToggleLike } from "../hooks/useToggleLike";

type PostFooterProps = {
  post: PublicPostResponseDto;
  onCommentClick: () => void;
};

export const PostFooter = ({ post, onCommentClick }: PostFooterProps) => {
  const { toggleLike } = useToggleLike();

  const activeTextColor = "text-primary-fuchsia-stroke-default";
  const inactiveTextColor = "text-text-neutral";

  return (
    <div className="w-full bg-transparent inline-flex justify-start items-start gap-3 sm:gap-4 mt-1 sm:mt-2">
      <div
        className="flex justify-start items-center gap-1.5 cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(post.id);
        }}
      >
        <div className="p-1 -m-1 flex items-center justify-center">
          <LikeIcon isLikedByMe={post.isLikedByMe} />
        </div>
        <div
          className={`justify-start text-xs sm:text-sm font-semibold font-sans ${
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
          className="group-hover:text-text-main transition-colors"
        >
          <CommentIcon />
        </div>
        <div className="justify-start text-text-neutral text-xs sm:text-sm font-semibold font-sans group-hover:text-text-main transition-colors">
          {post.commentsCount}
        </div>
      </div>
    </div>
  );
};
