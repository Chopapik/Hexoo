"use client";

import { useState, useEffect } from "react";
import type { PublicPostDto } from "../types/post.dto";
import { PostBody } from "./PostBody";
import { PostFooter } from "./PostFooter";
import { PostMeta } from "./PostMeta";
import { PostModal } from "./PostModal";
import { PostNsfwNotice } from "./PostNsfwNotice";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { initializeSettings } from "@/features/me/store/settingsSlice";

type PostCardProps = {
  post: PublicPostDto;
  revealNSFW?: boolean;
};

export const PostCard = ({ post, revealNSFW }: PostCardProps) => {
  const [showPostModal, setShowPostModal] = useState(false);

  const showNSFWPosts = useAppSelector(
    (state) => state.settings.showNSFWPosts,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeSettings());
  }, [dispatch]);

  const isContentVisible = !post.isNSFW || showNSFWPosts || revealNSFW;

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
          <PostBody post={post} isNSFW={post.isNSFW} />
        ) : (
          <PostNsfwNotice className="pointer-events-none" />
        )}
        <PostFooter post={post} onCommentClick={() => setShowPostModal(true)} />
      </div>
    </>
  );
};
