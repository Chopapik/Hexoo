"use client";

import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import useUserPosts from "../hooks/useUserPosts";
import { PostCard } from "@/features/posts/components/PostCard";
import { AppLoader } from "@/features/shared/components/ui/AppLoader";
import { useI18n } from "@/i18n/useI18n";

export function UserPostList({ userId }: { userId: string }) {
  const { t } = useI18n();
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
        toast.error(`${t("common.errorPrefix")}: ${error.code}`);
      } else {
        toast.error(t("profile.loadPostsError"));
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
      { threshold: 1.0 },
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
            className="w-full p-4 bg-surface-card-background-default rounded-xl border-t-2 border-surface-card-border-default animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-button-glass-card-background-hover" />
              <div className="w-32 h-3 bg-button-glass-card-background-hover rounded" />
            </div>
            <div className="w-full h-4 bg-button-glass-card-background-default rounded mb-2" />
            <div className="w-2/3 h-4 bg-button-glass-card-background-default rounded" />
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
          <AppLoader size="lg" className="text-foreground-secondary-default" />
        )}
      </div>

      {!hasNextPage && data?.pages[0]?.length !== 0 && (
        <p className="text-center text-foreground-secondary-default opacity-50 text-sm py-4">
          {t("profile.allPosts")}
        </p>
      )}

      {data?.pages[0]?.length === 0 && (
        <div className="text-center py-10 text-foreground-secondary-default font-sans">
          {t("profile.noPosts")}
        </div>
      )}
    </div>
  );
}
