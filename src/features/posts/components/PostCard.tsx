"use client";

import { useState, useEffect } from "react";
import type { Post } from "../types/post.type";
import { PostBody } from "./PostBody";
import { PostFooter } from "./PostFooter";
import { PostMeta } from "./PostMeta";
import AddCommentModal from "@/features/comments/components/AddCommentModal";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { initializeSettings } from "@/features/me/store/settingsSlice";

type PostCardProps = {
  post: Post;
  revealNSFW?: boolean;
};

export const PostCard = ({ post, revealNSFW }: PostCardProps) => {
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const showNSFW = useAppSelector((state) => state.settings.showNSFW);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeSettings());
  }, [dispatch]);

  const isContentVisible = !post.isNSFW || showNSFW || revealNSFW;

  return (
    <>
      {showAddCommentModal && (
        <AddCommentModal
          post={post}
          isOpen={showAddCommentModal}
          onClose={() => setShowAddCommentModal(false)}
        />
      )}
      <div className="w-full max-w-4xl p-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default inline-flex flex-col justify-start items-start gap-4">
        <PostMeta post={post} />

        {isContentVisible ? (
          <PostBody post={post} />
        ) : (
          <div className="w-full py-12 flex flex-col items-center justify-center gap-3 bg-primary-neutral-background-default transition-colors group">
            <div className="p-3 rounded-full bg-red-500/10 text-red-500 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-red-500 font-bold text-sm uppercase tracking-wider mb-1">
                Treść NSFW
              </p>
              <p className="text-text-neutral text-xs">
                Ten post zawiera treści dla dorosłych.
              </p>
            </div>
          </div>
        )}
        <PostFooter
          post={post}
          onCommentClick={() => setShowAddCommentModal(true)}
        />
      </div>
    </>
  );
};
