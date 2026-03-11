"use client";

import React, { useEffect, useMemo, useState } from "react";
import Modal from "@/features/shared/components/layout/Modal";
import Button from "@/features/shared/components/ui/Button";
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
  const [showCommentsMobile, setShowCommentsMobile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowCommentsMobile(false);
    }
  }, [isOpen, post.id]);

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
      <div className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row">
        {/* DESKTOP IMAGE */}
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
          className={`
            flex h-full min-h-0 flex-col border-l border-primary-neutral-stroke-default/60
            ${
              hasImage
                ? "w-full max-w-full border-l-0 lg:w-[420px] lg:min-w-[420px] lg:shrink-0 lg:border-l"
                : "w-full max-w-full"
            }
          `}
        >
          <div className="shrink-0 border-b border-primary-neutral-stroke-default/60 p-4">
            <PostMeta post={post} />
          </div>

          {/* MOBILE: WIDOK POSTA */}
          {!showCommentsMobile && (
            <div className="flex min-h-0 flex-1 flex-col lg:hidden">
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

              {hasImage && (
                <div className="flex w-full items-center justify-center overflow-hidden bg-black/20 max-h-[60vh]">
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

          {/* MOBILE: WIDOK KOMENTARZY */}
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
                <CommentList comments={comments} isLoading={isLoading} />
              </div>

              {user && (
                <div className="shrink-0 border-t border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60 p-4">
                  <CommentForm postId={post.id} />
                </div>
              )}
            </div>
          )}

          {/* DESKTOP: standardowy widok */}
          <div className="hidden min-h-0 flex-1 lg:flex lg:flex-col">
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
      </div>
    </Modal>
  );
};
