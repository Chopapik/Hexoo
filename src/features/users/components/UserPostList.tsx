"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import useUserPosts from "../hooks/useUserPosts";
import { PostList } from "@/features/posts/components/PostList";
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

  useEffect(() => {
    if (isError) {
      if (error instanceof ApiError) {
        toast.error(`${t("common.errorPrefix")}: ${error.code}`);
      } else {
        toast.error(t("profile.loadPostsError"));
      }
    }
  }, [isError, error, t]);

  return (
    <PostList
      data={data}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={Boolean(hasNextPage)}
      fetchNextPage={fetchNextPage}
      loadingCount={2}
      emptyMessage={t("profile.noPosts")}
      endMessage={t("profile.allPosts")}
    />
  );
}
