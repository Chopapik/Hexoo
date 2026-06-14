"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import { AppLoader } from "@/features/shared/components/ui/AppLoader";
import SelectionTabButton from "@/features/shared/components/ui/SelectionTabButton";
import {
  useModeratorDashboard,
  type ModeratorQueueTab,
} from "../hooks/useModeratorDashboard";
import { ModerationPostResponseDto } from "@/features/posts/types/post.dto";
import type { ModerationCommentResponseDto } from "@/features/comments/types/comment.dto";
import ModerationQueueItem from "./ModerationQueueItem";
import ModerationCommentQueueItem from "./ModerationCommentQueueItem";
import { useI18n } from "@/i18n/useI18n";

export default function ModeratorDashboard() {
  const { t } = useI18n();
  const [queueTab, setQueueTab] = useState<ModeratorQueueTab>("posts");
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    performPostAction,
    performCommentAction,
    isActionPending,
  } = useModeratorDashboard(queueTab);

  const observerTarget = useRef<HTMLDivElement>(null);

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

  const loadedCount =
    data?.pages.reduce((acc, page) => acc + page.length, 0) ?? 0;

  const queueSubtitle =
    queueTab === "posts"
      ? t("moderation.dashboard.postsSubtitle")
      : t("moderation.dashboard.commentsSubtitle");

  const emptyMessage =
    queueTab === "posts"
      ? t("moderation.dashboard.emptyPosts")
      : t("moderation.dashboard.emptyComments");

  return (
    <div className="w-full flex flex-col p-10 gap-10">
      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-foreground-primary-default text-xl font-semibold">
          {t("moderation.dashboard.title")}
        </span>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full p-6 border border-surface-card-border-default bg-surface-card-background-default rounded-2xl max-w-[1300px]">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3 min-w-0 flex-1">
              <div className="inline-flex rounded-xl border border-divider-default bg-surface-card-background-default p-1 self-start">
                <SelectionTabButton
                  isSelected={queueTab === "posts"}
                  onClick={() => setQueueTab("posts")}
                >
                  {t("moderation.dashboard.reportedPosts")}
                </SelectionTabButton>
                <SelectionTabButton
                  isSelected={queueTab === "comments"}
                  onClick={() => setQueueTab("comments")}
                >
                  {t("moderation.dashboard.reportedComments")}
                </SelectionTabButton>
              </div>
              <div>
                <h2 className="text-lg font-sans font-semibold">
                  {t("moderation.dashboard.queue")}
                </h2>
                <div className="text-sm text-foreground-secondary-default">
                  {queueSubtitle} {t("moderation.dashboard.loaded")}:{" "}
                  <span className="text-accent-fuchsia-background-default font-bold">
                    {loadedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => refetch()}
              text={t("common.refresh")}
                size="sm"
                isLoading={isFetching}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-foreground-secondary-default animate-pulse">
              {t("moderation.dashboard.loading")}
            </div>
          ) : isError ? (
            <div className="py-6 text-center text-validation-error-text">
              {t("moderation.dashboard.error")}
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              {data?.pages[0]?.length === 0 && (
                <div className="text-center text-foreground-secondary-default py-20 bg-button-glass-card-background-default rounded-xl border border-dashed border-surface-chrome-background-default">
                  <p className="text-sm mt-2 opacity-60">{emptyMessage}</p>
                </div>
              )}

              {data?.pages.map((group, i) => (
                <React.Fragment key={i}>
                  {queueTab === "posts"
                    ? (group as ModerationPostResponseDto[]).map(
                        (post: ModerationPostResponseDto) => (
                          <ModerationQueueItem
                            key={post.id}
                            post={post}
                            onAction={performPostAction}
                            isPending={isActionPending}
                          />
                        ),
                      )
                    : (group as ModerationCommentResponseDto[]).map(
                        (comment: ModerationCommentResponseDto) => (
                          <ModerationCommentQueueItem
                            key={comment.id}
                            comment={comment}
                            onAction={performCommentAction}
                            isPending={isActionPending}
                          />
                        ),
                      )}
                </React.Fragment>
              ))}

              <div
                ref={observerTarget}
                className="h-4 w-full flex justify-center py-4"
              >
                {isFetchingNextPage && (
                  <AppLoader size="lg" className="text-foreground-secondary-default" />
                )}
              </div>

              {!hasNextPage &&
                data &&
                data.pages.length > 0 &&
                data.pages[0].length > 0 && (
                  <div className="text-center text-foreground-secondary-default text-sm py-8 font-sans opacity-50">
                    {t("common.end")}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
