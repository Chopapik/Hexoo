"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/features/shared/components/layout/Modal";
import { PostMeta } from "./PostMeta";
import { CommentList } from "@/features/comments/components/CommentList";
import { CommentForm } from "@/features/comments/components/CommentForm";
import useComments from "@/features/comments/hooks/useComments";
import { useAppSelector } from "@/lib/store/hooks";
import { isAsciiArt } from "../utils/asciiDetector";
import { PublicPostDto } from "../types/post.dto";
import { PostNsfwNotice } from "./PostNsfwNotice";

interface PostModalProps {
  post: PublicPostDto;
  isOpen: boolean;
  onClose: () => void;
  revealNSFW?: boolean;
}

export const PostModal = ({
  post,
  isOpen,
  onClose,
  revealNSFW,
}: PostModalProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const showNSFW = useAppSelector((state) => state.settings.showNSFW);
  const { comments, isLoading } = useComments(post.id, isOpen);
  const isAscii = useMemo(() => isAsciiArt(post.text), [post.text]);
  const isContentVisible = !post.isNSFW || showNSFW || revealNSFW;

  const hasImage = !!post.imageUrl;
  const [isWideImage, setIsWideImage] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post"
      className={`
        h-[calc(100dvh-2rem)]
        max-h-[calc(100dvh-2rem)]
        overflow-hidden
        ${hasImage ? "max-w-[calc(100vw-2rem)]" : ""}
      `}
    >
      <div className="flex h-full min-h-0 overflow-hidden">
        {hasImage && (
          <div className="flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden bg-black/20">
            {isContentVisible ? (
              <img
                src={post.imageUrl ?? ""}
                alt="Post content"
                className={`block h-full max-w-full ${
                  isWideImage ? "w-full object-cover" : "w-auto object-contain"
                }`}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setIsWideImage(img.naturalWidth / img.naturalHeight >= 1.4);
                  }
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PostNsfwNotice />
              </div>
            )}
          </div>
        )}

        <div
          className={`
            flex h-full min-h-0 flex-col border-l border-primary-neutral-stroke-default/60
            ${hasImage ? "w-[420px] min-w-[420px] shrink-0" : "w-full max-w-full"}
          `}
        >
          <div className="shrink-0 border-b border-primary-neutral-stroke-default/60 p-4">
            <PostMeta post={post} />
          </div>

          {isContentVisible && post.text && (
            <div className="shrink-0 border-b border-primary-neutral-stroke-default/60 p-4">
              <p
                className={`text-text-main text-base ${
                  isAscii
                    ? "ascii-art"
                    : "font-Albert_Sans whitespace-pre-wrap wrap-break-word"
                }`}
              >
                {post.text}
              </p>
            </div>
          )}

          {!isContentVisible && !hasImage && (
            <div className="flex items-center justify-center p-4">
              <PostNsfwNotice />
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-hide">
            <CommentList comments={comments} isLoading={isLoading} />
          </div>

          {user && (
            <div className="shrink-0 border-t border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60 p-4">
              <CommentForm postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
