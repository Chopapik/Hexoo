"use client";

import CreatePostButton from "@/features/posts/components/CreatePostButton";
import HomePostList from "@/features/posts/components/HomePostList";
import { useAppStore } from "@/lib/store/store";

export default function HomePage() {
  const user = useAppStore((s) => s.auth.user);

  return (
    <div className="relative flex w-full flex-col gap-2 pb-8 md:pb-0 md:pt-0">
      {user ? <CreatePostButton /> : null}
      <HomePostList />
    </div>
  );
}
