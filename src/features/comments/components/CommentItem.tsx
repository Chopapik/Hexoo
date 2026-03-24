"use client";

import React from "react";
import type { PublicCommentResponseDto } from "../types/comment.dto";
import { Avatar } from "@/features/posts/components/Avatar";
import { formatSmartDate } from "@/features/shared/utils/dateUtils";
import Link from "next/link";
import { ExpandableImageThumbnail } from "@/features/shared/components/media/ExpandableImageThumbnail";

interface CommentItemProps {
  comment: PublicCommentResponseDto;
  /** Moderation queue: image as thumbnail with fullscreen lightbox */
  moderationCompactImage?: boolean;
  /** Moderation queue: larger body text than the parent-post context block */
  moderationProminent?: boolean;
}

export const CommentItem = ({
  comment,
  moderationCompactImage = false,
  moderationProminent = false,
}: CommentItemProps) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const avatarClass = moderationProminent ? "size-10" : "size-8";
  const avatarPx = moderationProminent ? 40 : 32;
  const nameClass = moderationProminent
    ? "text-text-main text-base font-semibold font-Albert_Sans hover:underline"
    : "text-text-main text-sm font-medium font-Albert_Sans hover:underline";
  const bodyClass = moderationProminent
    ? "text-text-main text-base leading-relaxed font-Albert_Sans whitespace-pre-wrap wrap-break-word"
    : "text-text-main text-sm font-Albert_Sans whitespace-pre-wrap wrap-break-word";
  const dateClass = moderationProminent
    ? "text-text-neutral text-sm font-Albert_Sans"
    : "text-text-neutral text-xs font-Albert_Sans";

  return (
    <div
      className={`flex gap-3 py-3 border-b border-primary-neutral-stroke-default/30 last:border-b-0 ${moderationProminent ? "gap-4" : ""}`}
    >
      <div className="shrink-0" onClick={handleLinkClick}>
        <Link href={`/${comment.userName}`}>
          <Avatar
            src={comment.userAvatarUrl ?? undefined}
            alt={comment.userName}
            className={avatarClass}
            width={avatarPx}
            height={avatarPx}
          />
        </Link>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/${comment.userName}`}
            className={nameClass}
            onClick={handleLinkClick}
          >
            {comment.userName}
          </Link>
          <span className={dateClass}>{formatSmartDate(comment.createdAt)}</span>
        </div>

        <p className={bodyClass}>{comment.text}</p>
        {comment.imageUrl &&
          (moderationCompactImage ? (
            <div className="mt-2">
              <ExpandableImageThumbnail
                src={comment.imageUrl}
                alt="Zdjęcie komentarza"
              />
            </div>
          ) : (
            <img
              src={comment.imageUrl}
              alt="Zdjęcie komentarza"
              className="mt-2 w-full max-w-xs rounded-xl border border-primary-neutral-stroke-default object-cover"
            />
          ))}
      </div>
    </div>
  );
};
