"use client";

import type { Post } from "../types/post.type";
import { CommentIcon } from "../icons/CommentIcon";
import { LikeIcon } from "../icons/LikeIcon";
import { useToggleLike } from "../hooks/useToggleLike";

type PostFooterProps = {
  post: Post;
};

export const PostFooter = ({ post }: PostFooterProps) => {
  const { toggleLike } = useToggleLike();

  const activeTextColor = "text-[#DB2777]";
  const inactiveTextColor = "text-text-neutral";

  return (
    <div className="w-full  bg-transparent inline-flex justify-start items-start gap-4 mt-2">
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
          className={`justify-start text-sm font-semibold font-Albert_Sans ${
            post.isLikedByMe ? activeTextColor : inactiveTextColor
          }`}
        >
          {post.likesCount}
        </div>
      </div>

      <div className="flex justify-start items-center gap-1.5 cursor-pointer group">
        <div
          data-svg-wrapper
          className="group-hover:text-text-main transition-colors"
        >
          <CommentIcon />
        </div>
        <div className="justify-start text-text-neutral text-sm font-semibold font-Albert_Sans group-hover:text-text-main transition-colors">
          {post.commentsCount}
        </div>
      </div>
    </div>
  );
};
