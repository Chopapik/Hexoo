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
import type { PublicPostResponseDto } from "../types/post.dto";
import { PostNsfwNotice } from "./PostNsfwNotice";
import { PostMedia } from "./PostMedia";
import { useI18n } from "@/i18n/useI18n";
import { cn } from "@/features/shared/utils/utils";

interface PostModalProps {
  post: PublicPostResponseDto;
  isOpen: boolean;
  onClose: () => void;
  revealNSFW?: boolean;
}

const commentFormWrapperClassName =
  "flex h-[220px] min-h-[220px] shrink-0 items-center justify-center border-t border-modal-chrome-border-default bg-modal-chrome-background-default p-4 backdrop-blur-[16px] lg:absolute lg:inset-x-0 lg:bottom-0 lg:z-10";

export const PostModal = ({
  post,
  isOpen,
  onClose,
  revealNSFW,
}: PostModalProps) => {
  const { t } = useI18n();
  const user = useAppStore((s) => s.auth.user);
  const showNSFWPosts = useAppStore((s) => s.settings.showNSFWPosts);
  const showNSFWComments = useAppStore((s) => s.settings.showNSFWComments);

  const { comments, isLoading } = useComments(post.id, isOpen);
  const visibleComments = useMemo(
    () =>
      showNSFWComments
        ? comments
        : comments.filter((comment) => !comment.isNSFW),
    [comments, showNSFWComments],
  );
  const hasHiddenNSFWComments = useMemo(
    () => !showNSFWComments && comments.some((comment) => comment.isNSFW),
    [comments, showNSFWComments],
  );

  const [showCommentsMobile, setShowCommentsMobile] = useState(false);

  const isAscii = useMemo(() => isAsciiArt(post.text), [post.text]);

  const hasImage = !!post.imageUrl;
  const isContentVisible = !post.isNSFW || showNSFWPosts || Boolean(revealNSFW);

  const textClassName = cn(
    "text-foreground-primary-default text-base",
    isAscii
      ? "max-w-full overflow-x-auto whitespace-pre rounded p-2 font-mono text-xs"
      : "font-sans whitespace-pre-wrap wrap-break-word",
  );

  const sidebarClassName = cn(
    "w-full max-w-full",
    hasImage &&
      "border-l-0 lg:w-[420px] lg:min-w-[420px] lg:shrink-0 lg:border-l",
  );

  const modalClassName = cn(
    "h-dvh max-h-dvh overflow-hidden lg:h-[calc(100dvh-2rem)] lg:max-h-[calc(100dvh-2rem)]",
    hasImage && "lg:!max-w-[calc(100vw-2rem)]",
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post"
      className={modalClassName}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
        {hasImage && post.imageUrl && isContentVisible && (
          <PostMedia
            src={post.imageUrl}
            alt={t("post.imageAlt")}
            presentation="modal"
            className="hidden lg:flex lg:h-full lg:max-h-full lg:min-w-0 lg:flex-1 lg:rounded-none lg:border-0"
          />
        )}

        {hasImage && post.imageUrl && !isContentVisible && (
          <div className="hidden lg:flex lg:h-full lg:max-h-full lg:min-w-0 lg:flex-1 lg:items-center lg:justify-center lg:overflow-hidden lg:bg-modal-overlay-background-default/30">
            <PostNsfwNotice />
          </div>
        )}

        <div
          className={cn(
            "flex h-full min-h-0 flex-col border-modal-chrome-border-default",
            sidebarClassName,
          )}
        >
          <div className="shrink-0 border-b border-modal-chrome-border-default p-3 sm:p-4">
            <PostMeta post={post} />
          </div>

          {!showCommentsMobile && (
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
              {isContentVisible && post.text && (
                <div className="shrink-0 border-b border-modal-chrome-border-default p-3 sm:p-4">
                  <p className={textClassName}>{post.text}</p>
                </div>
              )}

              {hasImage && post.imageUrl && (
                isContentVisible ? (
                  <PostMedia
                    src={post.imageUrl}
                    alt={t("post.imageAlt")}
                    presentation="modal"
                    className="max-h-[65dvh] w-full rounded-none border-0"
                  />
                ) : (
                  <div className="flex min-h-[220px] w-full items-center justify-center overflow-hidden bg-modal-overlay-background-default/30 p-4">
                    <PostNsfwNotice />
                  </div>
                )
              )}

              {!isContentVisible && !hasImage && (
                <div className="flex items-center justify-center p-4">
                  <PostNsfwNotice />
                </div>
              )}

              <div className="mt-auto shrink-0 p-3 sm:p-4">
                <Button
                  text={t("post.showComments")}
                  size="xl"
                  variant="secondary"
                  className="text-sm font-medium"
                  onClick={() => setShowCommentsMobile(true)}
                />
              </div>
            </div>
          )}

          {showCommentsMobile && (
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
              <div className="shrink-0 border-b border-modal-chrome-border-default p-3 sm:p-4">
                <Button
                  text={t("post.backToPost")}
                  size="xl"
                  variant="secondary"
                  className="text-sm font-medium"
                  onClick={() => setShowCommentsMobile(false)}
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-hide">
                <CommentList comments={visibleComments} isLoading={isLoading} />
                {hasHiddenNSFWComments && (
                  <p className="mt-3 text-center text-xs text-foreground-muted-default">
                    {t("post.hiddenNsfw")}
                  </p>
                )}
              </div>

              {user && (
                <div className={commentFormWrapperClassName}>
                  <CommentForm postId={post.id} />
                </div>
              )}
            </div>
          )}

          <div className="relative hidden min-h-0 flex-1 lg:flex lg:flex-col">
            {isContentVisible && post.text && (
              <div className="shrink-0 border-b border-modal-chrome-border-default p-4">
                <p className={textClassName}>{post.text}</p>
              </div>
            )}

            {!isContentVisible && !hasImage && (
              <div className="flex items-center justify-center p-4">
                <PostNsfwNotice />
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto p-4 pb-[236px] scrollbar-hide">
              <CommentList comments={visibleComments} isLoading={isLoading} />
              {hasHiddenNSFWComments && (
                <p className="mb-3 text-center text-xs text-foreground-muted-default">
                  {t("post.hiddenNsfw")}
                </p>
              )}
            </div>

            {user && (
              <div className={commentFormWrapperClassName}>
                <CommentForm postId={post.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
