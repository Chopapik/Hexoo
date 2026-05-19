"use client";

import React from "react";
import type { PublicPostResponseDto } from "../types/post.dto";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import PostOptions from "./PostOptions";
import Link from "next/link";
import { formatSmartDate } from "@/features/shared/utils/dateUtils";
import { useI18n } from "@/i18n/useI18n";

type PostMetaProps = {
  post: PublicPostResponseDto;
};

export const PostMeta = ({ post }: PostMetaProps) => {
  const { lang } = useI18n();

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="w-full flex justify-between items-start">
      <div className="inline-flex justify-start items-center gap-2">
        <div className="size-9 sm:size-10" onClick={handleLinkClick}>
          <Link href={`/profile/${post.userId}`}>
            <Avatar
              src={post.userAvatarUrl ?? undefined}
              alt={post.userName ?? undefined}
              className="size-9 sm:size-10"
            />
          </Link>
        </div>
        <div className="self-stretch inline-flex flex-col justify-center items-start">
          <div
            className="justify-start text-text-main text-xs sm:text-sm font-medium font-sans"
            onClick={handleLinkClick}
          >
            <Link
              href={`/profile/${post.userId}`}
              className="hover:underline"
            >
              {post.userName}
            </Link>
          </div>
          <div className="inline-flex justify-center items-center gap-1">
            <div className="justify-start text-text-neutral text-[11px] sm:text-xs font-normal font-sans">
              {formatSmartDate(post.createdAt, lang)}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-1" onClick={handleLinkClick}>
        <PostOptions postId={post.id} authorId={post.userId} post={post} />
      </div>
    </div>
  );
};
