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
      <article
        onClick={handleCardClick}
        className="group w-full max-w-4xl bg-primary-neutral-background-default/80 backdrop-blur-sm rounded-2xl border border-primary-neutral-stroke-default/40 hover:border-primary-neutral-stroke-hover/60 transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-lg hover:shadow-primary-fuchsia-background-default/5"
      >
        <div className="p-4 sm:p-5 flex flex-col gap-4">
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
        </div>
        
        <div className="px-4 sm:px-5 py-3 border-t border-primary-neutral-stroke-default/30 bg-primary-neutral-background-default/50">
          <PostFooter post={post} onCommentClick={() => setShowPostModal(true)} />
        </div>
      </article>
    </>
  );
};
