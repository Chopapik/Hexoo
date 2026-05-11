"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PublicPostResponseDto } from "../types/post.dto";
import { PostCard } from "./PostCard";
import usePosts from "../hooks/usePosts";
import { AppLoader } from "@/features/shared/components/ui/AppLoader";

type PostListProps = {
  className?: string;
};

const joinClassNames = (className?: string) =>
  ["w-full", className].filter(Boolean).join(" ");

export default function PostList({ className = "" }: PostListProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  const observerTarget = useRef<HTMLDivElement>(null);
  const [imageReadyByPostId, setImageReadyByPostId] = useState<
    Record<string, boolean>
  >({});

  const visiblePosts = data?.pages.flat() ?? [];

  useEffect(() => {
    const posts = data?.pages.flat() ?? [];

    if (!posts.length) {
      setImageReadyByPostId({});
      return;
    }

    setImageReadyByPostId((previous) => {
      const next: Record<string, boolean> = {};
      for (const post of posts) {
        next[post.id] = previous[post.id] ?? false;
      }
      return next;
    });
  }, [data?.pages]);

  const areVisiblePostsVisuallyReady = visiblePosts.every((post) => {
    if (!post.imageUrl) return true;
    return imageReadyByPostId[post.id] === true;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <main className={joinClassNames(className)}>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full max-w-[920px] p-3 sm:p-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default flex flex-col gap-3 sm:gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="flex flex-col gap-2">
                  <div className="w-32 h-3 bg-white/10 rounded" />
                  <div className="w-20 h-2 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-full h-4 bg-white/5 rounded" />
              <div className="w-2/3 h-4 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <div className="w-full text-center py-10 text-red-500 font-sans">
        Nie udało się załadować postów.
      </div>
    );
  }

  return (
    <main className={joinClassNames(className)}>
      <div className="space-y-3 sm:space-y-4">
        {data?.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((post: PublicPostResponseDto) => (
              <PostCard key={post.id} post={post} />
            ))}
          </React.Fragment>
        ))}

        <div
          ref={observerTarget}
          className="h-4 w-full flex justify-center py-4"
        >
          {isFetchingNextPage && (
            <AppLoader size="lg" className="text-text-neutral" />
          )}
        </div>

        {!hasNextPage && data && data.pages.length > 0 && (
          <div className="text-center text-text-neutral text-sm py-8 font-sans opacity-50">
            konec
          </div>
        )}
      </div>
    </main>
  );
}
