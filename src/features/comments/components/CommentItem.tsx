"use client";

import React from "react";
import { Comment } from "../types/comment.type";
import { Avatar } from "@/features/posts/components/Avatar";
import { formatSmartDate } from "@/features/shared/utils/dateUtils";
import Link from "next/link";

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex gap-3 py-3 border-b border-primary-neutral-stroke-default/30 last:border-b-0">
      <div className="shrink-0" onClick={handleLinkClick}>
        <Link href={`/${comment.userName}`}>
          <Avatar
            src={comment.userAvatarUrl ?? undefined}
            alt={comment.userName}
            className="size-8"
            width={32}
            height={32}
          />
        </Link>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/${comment.userName}`}
            className="text-text-main text-sm font-medium font-Albert_Sans hover:underline"
            onClick={handleLinkClick}
          >
            {comment.userName}
          </Link>
          <span className="text-text-neutral text-xs font-Albert_Sans">
            {formatSmartDate(comment.createdAt)}
          </span>
        </div>

        <p className="text-text-main text-sm font-Albert_Sans whitespace-pre-wrap break-words">
          {comment.text}
        </p>
      </div>
    </div>
  );
};
