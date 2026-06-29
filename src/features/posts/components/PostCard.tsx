"use client";

import { useState, useEffect } from "react";
import type { PublicPostResponseDto } from "../types/post.dto";
import { PostBody } from "./PostBody";
import { PostFooter } from "./PostFooter";
import { PostMeta } from "./PostMeta";
import { PostModal } from "./PostModal";
import { PostNsfwNotice } from "./PostNsfwNotice";
import { useAppStore } from "@/lib/store/store";

type PostCardProps = {
  post: PublicPostResponseDto;
  revealNSFW?: boolean;
  /** Moderation queue: images as thumbnails with lightbox */
  moderationThumbnailImage?: boolean;
  onImageReadyChange?: (postId: string, isReady: boolean) => void;
};

export const PostCardSkeleton = () => (
  <div className="inline-flex w-full animate-pulse flex-col items-start justify-start gap-4 rounded-xl border-t border-surface-card-border-default bg-surface-card-background-default p-3">
    <div className="flex min-h-11 w-full items-start justify-between">
      <div className="inline-flex min-h-10 items-center justify-start gap-2">
        <div className="size-9 rounded-xl bg-button-glass-card-background-hover md:size-10" />
        <div className="inline-flex self-stretch flex-col items-start justify-center gap-1.5">
          <div className="h-4 w-32 rounded bg-button-glass-card-background-hover" />
          <div className="h-3 w-20 rounded bg-button-glass-card-background-default" />
        </div>
      </div>

      <div className="h-8 w-8 rounded-lg bg-button-glass-card-background-default" />
    </div>

    <div className="inline-flex w-full self-stretch flex-col items-center justify-center gap-3 overflow-hidden">
      <div className="h-6 w-full rounded bg-button-glass-card-background-default md:h-5" />
      <div className="h-6 w-2/3 self-start rounded bg-button-glass-card-background-default md:h-5" />
    </div>

    <div className="inline-flex h-5 w-full items-start justify-start gap-4 bg-transparent">
      <div className="h-5 w-12 rounded bg-button-glass-card-background-default" />
      <div className="h-5 w-12 rounded bg-button-glass-card-background-default" />
    </div>
  </div>
);

export const PostCard = ({
  post,
  revealNSFW,
  moderationThumbnailImage = false,
  onImageReadyChange,
}: PostCardProps) => {
  const [showPostModal, setShowPostModal] = useState(false);

  const showNSFWPosts = useAppStore((s) => s.settings.showNSFWPosts);

  const isContentVisible = !post.isNSFW || showNSFWPosts || revealNSFW;
  const hasVisibleImage = Boolean(post.imageUrl) && isContentVisible;

  useEffect(() => {
    if (!post.imageUrl || !hasVisibleImage) {
      onImageReadyChange?.(post.id, true);
    }
  }, [post.id, post.imageUrl, hasVisibleImage, onImageReadyChange]);

  const handleCardClick = () => {
    setShowPostModal(true);
  };

  return (
    <>
      <PostModal
        post={post}
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        revealNSFW={revealNSFW}
      />
      <div
        onClick={handleCardClick}
        className="inline-flex w-full cursor-pointer flex-col items-start justify-start gap-4 rounded-xl border-t border-surface-card-border-default bg-surface-card-background-default p-3"
      >
        <PostMeta post={post} />

        {isContentVisible ? (
          <PostBody
            post={post}
            isNSFW={post.isNSFW}
            moderationThumbnailImage={moderationThumbnailImage}
            onImageReadyChange={(isReady) =>
              onImageReadyChange?.(post.id, isReady)
            }
          />
        ) : (
          <PostNsfwNotice className="pointer-events-none" />
        )}
        <PostFooter post={post} onCommentClick={() => setShowPostModal(true)} />
      </div>
    </>
  );
};
