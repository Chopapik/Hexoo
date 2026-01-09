"use client";

import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import useUserPosts from "../hooks/useUserPosts";
import { PostCard } from "@/features/posts/components/PostCard";

export function UserPostList({ userId }: { userId: string }) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(userId);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isError) {
      if (error instanceof ApiError) {
        toast.error(`Błąd: ${error.code}`);
      } else {
        toast.error("Wystąpił nieznany błąd podczas ładowania postów");
      }
    }
  }, [isError, error]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-full p-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="w-32 h-3 bg-white/10 rounded" />
            </div>
            <div className="w-full h-4 bg-white/5 rounded mb-2" />
            <div className="w-2/3 h-4 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </React.Fragment>
      ))}

      <div
        ref={observerTarget}
        className="h-10 flex justify-center items-center"
      >
        {isFetchingNextPage && (
          <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {!hasNextPage && data?.pages[0]?.length !== 0 && (
        <p className="text-center text-text-neutral opacity-50 text-sm py-4">
          To wszystkie posty tego użytkownika
        </p>
      )}

      {data?.pages[0]?.length === 0 && (
        <div className="text-center py-10 text-text-neutral font-Albert_Sans">
          Ten użytkownik nie dodał jeszcze żadnych postów.
        </div>
      )}
    </div>
  );
}
