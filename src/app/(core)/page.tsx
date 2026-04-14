"use client";

import CreatePostButton from "@/features/posts/components/CreatePostButton";
import PostList from "@/features/posts/components/PostList";
import { useAppStore } from "@/lib/store/store";

export default function HomePage() {
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  return (
    <div className="relative">
      <div className="w-full max-w-4xl mb-4 flex justify-end">
        <CreatePostButton onClick={openCreatePostModal} />
      </div>
      <PostList />
    </div>
  );
}
