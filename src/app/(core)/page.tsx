"use client";

import CreatePostButton from "@/features/posts/components/CreatePostButton";
import PostList from "@/features/posts/components/PostList";
import { useAppDispatch } from "@/lib/store/hooks";
import { openCreatePostModal } from "@/features/posts/store/createPostModalSlice";

export default function HomePage() {
  const dispatch = useAppDispatch();

  return (
    <div className="relative">
      <div className="w-full max-w-4xl mb-4 flex justify-end">
        <CreatePostButton onClick={() => dispatch(openCreatePostModal())} />
      </div>
      <PostList />
    </div>
  );
}
