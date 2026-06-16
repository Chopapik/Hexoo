"use client";

import CreatePostButton from "@/features/posts/components/CreatePostButton";
import PostList from "@/features/posts/components/PostList";
import { useAppStore } from "@/lib/store/store";

export default function HomePage() {
  const user = useAppStore((s) => s.auth.user);

  return (
    <div className="relative flex w-full flex-col gap-2 pb-8 pt-[108px] md:gap-3 md:pb-0 md:pt-[7px]">
      {user ? <CreatePostButton /> : null}
      <PostList />
    </div>
  );
}
