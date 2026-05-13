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
        <div className="space-y-4 sm:space-y-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full max-w-4xl bg-primary-neutral-background-default/80 backdrop-blur-sm rounded-2xl border border-primary-neutral-stroke-default/40 overflow-hidden animate-pulse"
            >
              <div className="p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 sm:size-11 rounded-full bg-primary-neutral-stroke-default/30" />
                  <div className="flex flex-col gap-2">
                    <div className="w-28 h-4 bg-primary-neutral-stroke-default/30 rounded-full" />
                    <div className="w-16 h-3 bg-primary-neutral-stroke-default/20 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-primary-neutral-stroke-default/20 rounded-full" />
                  <div className="w-3/4 h-4 bg-primary-neutral-stroke-default/20 rounded-full" />
                  <div className="w-1/2 h-4 bg-primary-neutral-stroke-default/20 rounded-full" />
                </div>
              </div>
              <div className="px-4 sm:px-5 py-3 border-t border-primary-neutral-stroke-default/30 bg-primary-neutral-background-default/50">
                <div className="flex gap-2">
                  <div className="w-16 h-8 bg-primary-neutral-stroke-default/20 rounded-full" />
                  <div className="w-16 h-8 bg-primary-neutral-stroke-default/20 rounded-full" />
                </div>
              </div>
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
      <div className="space-y-4 sm:space-y-5">
        {data?.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((post: PublicPostResponseDto) => (
              <PostCard key={post.id} post={post} />
            ))}
          </React.Fragment>
        ))}

        <div
          ref={observerTarget}
          className="h-4 w-full flex justify-center py-6"
        >
          {isFetchingNextPage && (
            <AppLoader size="lg" className="text-primary-fuchsia-stroke-default" />
          )}
        </div>

        {!hasNextPage && data && data.pages.length > 0 && (
          <div className="text-center py-10">
            <span className="text-text-neutral/40 text-sm font-sans tracking-wide">
              konec
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
