"use client";

import usePosts from "../hooks/usePosts";
import { PostList } from "./PostList";

export const PostFeed = () => {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-primary-neutral-text-default">
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Failed to load posts. Please try again later.
      </div>
    );
  }

  return <PostList posts={posts || []} />;
};
