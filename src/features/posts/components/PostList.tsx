"use client";

import React, { useEffect, useRef } from "react";
import type { Post } from "../types/post.type";
import { PostCard } from "./PostLayout";
import usePosts from "../hooks/usePosts";

type PostListProps = {
  className?: string;
};

const joinClassNames = (className?: string) =>
  ["w-full", className].filter(Boolean).join(" ");

export const PostList = ({ className = "" }: PostListProps) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full max-w-[920px] p-4 bg-primary-neutral-background-default rounded-xl border-t-2 border-primary-neutral-stroke-default flex flex-col gap-4 animate-pulse"
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
      <div className="w-full text-center py-10 text-red-500 font-Albert_Sans">
        Nie udało się załadować postów.
      </div>
    );
  }

  return (
    <main className={joinClassNames(className)}>
      <div className="space-y-4">
        {data?.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </React.Fragment>
        ))}

        <div
          ref={observerTarget}
          className="h-4 w-full flex justify-center py-4"
        >
          {isFetchingNextPage && (
            <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {!hasNextPage && data && data.pages.length > 0 && (
          <div className="text-center text-text-neutral text-sm py-8 font-Albert_Sans opacity-50">
            To już wszystko na dziś
          </div>
        )}

        {!hasNextPage && data?.pages[0]?.length === 0 && (
          <div className="text-center text-text-neutral text-lg py-12 font-Albert_Sans">
            Brak postów. Bądź pierwszy i napisz coś!
          </div>
        )}
      </div>
    </main>
  );
};
