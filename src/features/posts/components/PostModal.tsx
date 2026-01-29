"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PostMeta } from "./PostMeta";
import { CommentList } from "@/features/comments/components/CommentList";
import { CommentForm } from "@/features/comments/components/CommentForm";
import useComments from "@/features/comments/hooks/useComments";
import { useAppSelector } from "@/lib/store/hooks";
import { isAsciiArt } from "../utils/asciiDetector";
import { useMemo } from "react";
import { PublicPostDto } from "../types/post.dto";

interface PostModalProps {
  post: PublicPostDto;
  isOpen: boolean;
  onClose: () => void;
}

export const PostModal = ({ post, isOpen, onClose }: PostModalProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const { comments, isLoading } = useComments(post.id, isOpen);
  const isAscii = useMemo(() => isAsciiArt(post.text), [post.text]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/80 "
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            onClick={handleModalClick}
            className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl bg-secondary-neutral-background-default/60 backdrop-blur-xl text-text-main border border-primary-neutral-stroke-default shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary-neutral-stroke-default bg-secondary-neutral-background-default/60">
              <span className="text-sm font-semibold text-text-main font-Albert_Sans">
                Post
              </span>
              <button
                onClick={onClose}
                className="text-text-neutral hover:text-text-main transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Content - 75% post / 25% comments */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left side - Post content (75%) */}
              <div className="w-5/7 flex flex-col overflow-y-auto scrollbar-hide border-r border-primary-neutral-stroke-default/60">
                {/* Post header */}
                <div className="p-4 border-b border-primary-neutral-stroke-default/60">
                  <PostMeta post={post} />
                </div>

                {/* Post content */}
                <div className="flex-1 flex flex-col">
                  {/* Text content */}
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

                  {/* Image - stretched to fill available space */}
                  {post.imageUrl && (
                    <div className="flex-1 flex items-center justify-center p-4 pt-0">
                      <img
                        className="w-full max-h-[60vh] object-contain rounded-xl"
                        src={post.imageUrl}
                        alt="Post content"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Comments (25%) */}
              <div className="w-2/7 flex flex-col min-w-[280px] border-l border-primary-neutral-stroke-default/60">
                {/* Comments header */}
                <div className="px-4 py-3 border-b border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60">
                  <h3 className="text-sm font-semibold text-text-main font-Albert_Sans">
                    Komentarze ({post.commentsCount})
                  </h3>
                </div>

                {/* Comments list */}
                <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
                  <CommentList comments={comments} isLoading={isLoading} />
                </div>

                {/* Comment form */}
                {user && (
                  <div className="px-4 py-3 border-t border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60">
                    <CommentForm postId={post.id} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
