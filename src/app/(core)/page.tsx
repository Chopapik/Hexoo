"use client";

import CreatePostButton from "@/features/posts/components/CreatePostButton";
import PostList from "@/features/posts/components/PostList";
import { useAppStore } from "@/lib/store/store";

export default function HomePage() {
  const user = useAppStore((s) => s.auth.user);
  const openCreatePostModal = useAppStore((s) => s.openCreatePostModal);

  return (
    <div className="relative">
      {user ? (
        <div className="w-full max-w-4xl mb-4 flex justify-end">
          <CreatePostButton onClick={openCreatePostModal} />
        </div>
      ) : null}
      <PostList />
    </div>
  );
}
