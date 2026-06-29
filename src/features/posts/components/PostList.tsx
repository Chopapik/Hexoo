"use client";

import React, { useEffect, useRef } from "react";
import type { PublicPostResponseDto } from "../types/post.dto";
import { PostCard, PostCardSkeleton } from "./PostCard";
import { AppLoader } from "@/features/shared/components/ui/AppLoader";

type PostListProps = {
  data?: { pages: PublicPostResponseDto[][] } | null;
  isLoading: boolean;
  isError?: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  className?: string;
  loadingCount?: number;
  errorMessage?: string;
  emptyMessage?: string;
  endMessage?: string;
  as?: "div" | "main";
};

const joinClassNames = (className?: string) =>
  ["w-full", className].filter(Boolean).join(" ");

export function PostList({
  data,
  isLoading,
  isError = false,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  className = "",
  loadingCount = 3,
  errorMessage,
  emptyMessage,
  endMessage,
  as: Component = "div",
}: PostListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasPosts = data?.pages.some((group) => group.length > 0) ?? false;

  useEffect(() => {
    const target = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Component className={joinClassNames(className)}>
        <div className="space-y-2">
          {Array.from({ length: loadingCount }, (_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </Component>
    );
  }

  if (isError && errorMessage) {
    return (
      <div className="w-full text-center py-10 text-validation-error-text font-sans">
        {errorMessage}
      </div>
    );
  }

  return (
    <Component className={joinClassNames(className)}>
      <div className="space-y-2">
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
            <AppLoader
              size="lg"
              className="text-foreground-secondary-default"
            />
          )}
        </div>

        {!hasNextPage && data && hasPosts && endMessage && (
          <div className="text-center text-foreground-secondary-default text-sm py-8 font-sans opacity-50">
            {endMessage}
          </div>
        )}

        {data && !hasPosts && emptyMessage && (
          <div className="text-center py-10 text-foreground-secondary-default font-sans">
            {emptyMessage}
          </div>
        )}
      </div>
    </Component>
  );
}
