"use client";

import usePosts from "../hooks/usePosts";
import { useI18n } from "@/i18n/useI18n";
import { PostList } from "./PostList";

type HomePostListProps = {
  className?: string;
};

export default function HomePostList({ className = "" }: HomePostListProps) {
  const { t } = useI18n();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  return (
    <PostList
      as="main"
      className={className}
      data={data}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={Boolean(hasNextPage)}
      fetchNextPage={fetchNextPage}
      errorMessage={t("post.loadError")}
      endMessage={t("post.end")}
    />
  );
}
