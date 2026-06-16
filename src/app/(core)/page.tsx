"use client";

import CreatePostButton from "@/features/posts/components/CreatePostButton";
import PostList from "@/features/posts/components/PostList";
import { useAppStore } from "@/lib/store/store";

export default function HomePage() {
  const user = useAppStore((s) => s.auth.user);

  return (
    <div className="relative pb-[83px] pt-2 md:pt-[7px]">
      {user ? (
        <div className="mb-2 flex w-full max-w-4xl justify-end md:mb-3">
          <CreatePostButton />
        </div>
      ) : null}
      <PostList />
    </div>
  );
}
