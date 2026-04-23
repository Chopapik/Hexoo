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

export const PostCard = ({
  post,
  revealNSFW,
  moderationThumbnailImage = false,
  onImageReadyChange,
}: PostCardProps) => {
  const [showPostModal, setShowPostModal] = useState(false);

  const showNSFWPosts = useAppStore((s) => s.settings.showNSFWPosts);
  const initializeSettings = useAppStore((s) => s.initializeSettings);
  const initializeDitheringSettings = useAppStore(
    (s) => s.initializeDitheringSettings,
  );

  useEffect(() => {
    initializeSettings();
    initializeDitheringSettings();
  }, [initializeDitheringSettings, initializeSettings]);

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
        className="w-full max-w-4xl p-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex flex-col justify-start items-start gap-4 cursor-pointer"
      >
        <PostMeta post={post} />

        {isContentVisible ? (
          <PostBody
            post={post}
            isNSFW={post.isNSFW}
            moderationThumbnailImage={moderationThumbnailImage}
            onImageReadyChange={(isReady) => onImageReadyChange?.(post.id, isReady)}
          />
        ) : (
          <PostNsfwNotice className="pointer-events-none" />
        )}
        <PostFooter post={post} onCommentClick={() => setShowPostModal(true)} />
      </div>
    </>
  );
};
