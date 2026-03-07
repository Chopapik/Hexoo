"use client";

import React, { useMemo } from "react";
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post"
      className="max-w-6xl max-h-[90vh]"
    >
      <div className="flex flex-row overflow-hidden min-h-[400px] max-h-[70vh]">
        <div className="min-w-0 flex-[5_2_0%] flex flex-col border-r border-primary-neutral-stroke-default/60">
          <div className="p-4 border-b border-primary-neutral-stroke-default/60">
            <PostMeta post={post} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
            {isContentVisible ? (
              <>
                {post.text && (
                  <div className="p-4">
                    <p
                      className={`text-text-main text-base ${
                        isAscii
                          ? "ascii-art"
                          : "font-Albert_Sans whitespace-pre-wrap break-words"
                      }`}
                    >
                      {post.text}
                    </p>
                  </div>
                )}
                {post.imageUrl && (
                  <div className="flex items-center justify-center p-4 pt-0">
                    <img
                      className="w-full max-h-[60vh] object-contain rounded-xl"
                      src={post.imageUrl}
                      alt="Post content"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center p-4 min-h-[200px]">
                <PostNsfwNotice />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-[2_2_0%] min-w-[280px] min-h-0 shrink-0 ">
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-4 ">
            <CommentList comments={comments} isLoading={isLoading} />
          </div>
          {user && (
            <div className="p-4 border-t border-primary-neutral-stroke-default/60 shrink-0 bg-secondary-neutral-background-default/60">
              <CommentForm postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
