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
    <div className="flex min-h-11 w-full items-start justify-between">
      <div className="inline-flex min-h-10 items-center justify-start gap-2">
        <div className="size-9 md:size-10" onClick={handleLinkClick}>
          <Link
            href={`/profile/${post.userId}`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
          >
            <Avatar
              src={post.userAvatarUrl ?? undefined}
              alt={post.userName ?? undefined}
              className="size-9 rounded-xl md:size-10"
            />
          </Link>
        </div>
        <div className="inline-flex self-stretch flex-col items-start justify-center gap-0.5">
          <div
            className="justify-start font-sans text-sm font-medium leading-[1.2] text-foreground-primary-default"
            onClick={handleLinkClick}
          >
            <Link
              href={`/profile/${post.userId}`}
              className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
            >
              {post.userName}
            </Link>
          </div>
          <div className="inline-flex items-center justify-center gap-1">
            <div className="justify-start font-sans text-xs font-normal leading-[1.2] text-foreground-secondary-default">
              {formatSmartDate(post.createdAt, lang)}
            </div>
          </div>
        </div>
      </div>

      <div onClick={handleLinkClick}>
        <PostOptions postId={post.id} authorId={post.userId} post={post} />
      </div>
    </div>
  );
};
