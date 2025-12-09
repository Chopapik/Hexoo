"use client";

import CreatePostModal from "@/features/posts/components/CreatePostModal";
import CreatePostButton from "@/features/posts/components/CreatePostButton";
import { PostList } from "@/features/posts/components/PostList";
import { useState } from "react";

export default function HomePage() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="relative">
      <div className="w-full max-w-4xl mb-4 flex justify-end">
        <CreatePostButton onClick={() => setCreateModalOpen(true)} />
      </div>
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <PostList />
    </div>
  );
}
