"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
import { PostMeta } from "./PostMeta";
import { CommentList } from "@/features/comments/components/CommentList";
import { CommentForm } from "@/features/comments/components/CommentForm";
import useComments from "@/features/comments/hooks/useComments";
import { useAppStore } from "@/lib/store/store";
import { isAsciiArt } from "../utils/asciiDetector";
import { PublicPostResponseDto } from "../types/post.dto";
import { PostNsfwNotice } from "./PostNsfwNotice";

interface PostModalProps {
  post: PublicPostResponseDto;
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
  const user = useAppStore((s) => s.auth.user);
  const showNSFWPosts = useAppStore((s) => s.settings.showNSFWPosts);
  const showNSFWComments = useAppStore((s) => s.settings.showNSFWComments);

  const { comments, isLoading } = useComments(post.id, isOpen);
  const visibleComments = showNSFWComments
    ? comments
    : comments.filter((comment) => !comment.isNSFW);
  const hasHiddenNSFWComments =
    !showNSFWComments && comments.some((comment) => comment.isNSFW);

  const [showCommentsMobile, setShowCommentsMobile] = useState(false);

  const isAscii = useMemo(() => isAsciiArt(post.text), [post.text]);

  const hasImage = !!post.imageUrl;
  const isContentVisible = !post.isNSFW || showNSFWPosts || revealNSFW;

  const textClassName = `text-text-main text-base ${
    isAscii
      ? "ascii-art"
      : "font-Albert_Sans whitespace-pre-wrap wrap-break-word"
  }`;

  const sidebarClassName = hasImage
    ? "w-full max-w-full border-l-0 lg:w-[420px] lg:min-w-[420px] lg:shrink-0 lg:border-l"
    : "w-full max-w-full";

  const modalClassName = `
    h-[calc(100dvh-2rem)]
    max-h-[calc(100dvh-2rem)]
    overflow-hidden
    ${hasImage ? "max-w-[calc(100vw-2rem)]" : ""}
  `;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post"
      className={modalClassName}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
        {hasImage && (
          <div className="hidden lg:flex lg:h-full lg:max-h-full lg:min-w-0 lg:flex-1 lg:items-center lg:justify-center lg:overflow-hidden lg:bg-black/20">
            {isContentVisible ? (
              <img
                src={post.imageUrl ?? ""}
                alt="Post content"
                className="block lg:h-full lg:max-h-full lg:w-auto lg:max-w-full lg:object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PostNsfwNotice />
              </div>
            )}
          </div>
        )}

        <div
          className={`flex h-full min-h-0 flex-col border-primary-neutral-stroke-default/60 ${sidebarClassName}`}
        >
          <div className="shrink-0 border-b border-primary-neutral-stroke-default/60 p-4">
            <PostMeta post={post} />
          </div>

          {!showCommentsMobile && (
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
              {isContentVisible && post.text && (
                <div className="shrink-0 border-b border-primary-neutral-stroke-default/60 p-4">
                  <p className={textClassName}>{post.text}</p>
                </div>
              )}

              {hasImage && (
                <div className="flex max-h-[60vh] w-full items-center justify-center overflow-hidden bg-black/20">
                  {isContentVisible ? (
                    <img
                      src={post.imageUrl ?? ""}
                      alt="Post content"
                      className="block max-h-[60vh] w-auto max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-4">
                      <PostNsfwNotice />
                    </div>
                  )}
                </div>
              )}

              {!isContentVisible && !hasImage && (
                <div className="flex items-center justify-center p-4">
                  <PostNsfwNotice />
                </div>
              )}

              <div className="mt-auto shrink-0 p-4">
                <Button
                  text="Pokaż komentarze"
                  size="xl"
                  variant="secondary"
                  className="border border-primary-neutral-stroke-default/60 text-sm font-medium"
                  onClick={() => setShowCommentsMobile(true)}
                />
              </div>
            </div>
          )}

          {showCommentsMobile && (
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
              <div className="shrink-0 border-b border-primary-neutral-stroke-default/60 p-4">
                <Button
                  text="Wróć do posta"
                  size="xl"
                  variant="secondary"
                  className="border border-primary-neutral-stroke-default/60 text-sm font-medium"
                  onClick={() => setShowCommentsMobile(false)}
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-hide">
                <CommentList comments={visibleComments} isLoading={isLoading} />
                {hasHiddenNSFWComments && (
                  <p className="mt-3 text-center text-xs text-text-muted">
                    Część treści dla dorosłych jest ukryta zgodnie z
                    ustawieniami.
                  </p>
                )}
              </div>

              {user && (
                <div className="shrink-0 border-t border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60 p-4">
                  <CommentForm postId={post.id} />
                </div>
              )}
            </div>
          )}

          <div className="hidden min-h-0 flex-1 lg:flex lg:flex-col">
            {isContentVisible && post.text && (
              <div className="shrink-0 border-b border-primary-neutral-stroke-default/60 p-4">
                <p className={textClassName}>{post.text}</p>
              </div>
            )}

            {!isContentVisible && !hasImage && (
              <div className="flex items-center justify-center p-4">
                <PostNsfwNotice />
              </div>
            )}

            <div className="min-h-0 flex-1 flex flex-col overflow-y-auto p-4 scrollbar-hide justify-between">
              <CommentList comments={visibleComments} isLoading={isLoading} />
              {hasHiddenNSFWComments && (
                <p className="mb-3 text-center text-xs text-text-muted text-text-neutral">
                  Część treści dla dorosłych jest ukryta zgodnie z ustawieniami.
                </p>
              )}
            </div>

            {user && (
              <div className="shrink-0 border-t border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60 p-4">
                <CommentForm postId={post.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
