"use client";

import { useState } from "react";
import type { Post } from "../types/post.type";
import { PostBody } from "./PostBody";
import { PostFooter } from "./PostFooter";
import { PostMeta } from "./PostMeta";
import AddCommentModal from "@/features/comments/components/AddCommentModal.tsx";

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);

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
        <PostBody post={post} />
        <PostFooter
          post={post}
          onCommentClick={() => setShowAddCommentModal(true)}
        />
      </div>
    </>
  );
};
