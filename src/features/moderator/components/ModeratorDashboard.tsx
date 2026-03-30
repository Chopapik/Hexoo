"use client";

import React, { useEffect, useRef, useState } from "react";
import Button from "@/features/shared/components/ui/Button";
import SelectionTabButton from "@/features/shared/components/ui/SelectionTabButton";
import {
  useModeratorDashboard,
  type ModeratorQueueTab,
} from "../hooks/useModeratorDashboard";
import { ModerationPostResponseDto } from "@/features/posts/types/post.dto";
import type { ModerationCommentResponseDto } from "@/features/comments/types/comment.dto";
import ModerationQueueItem from "./ModerationQueueItem";
import ModerationCommentQueueItem from "./ModerationCommentQueueItem";

export default function ModeratorDashboard() {
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
      ? "Posty oflagowane przez AI lub zgłoszone przez użytkowników."
      : "Komentarze oczekujące na moderację (np. flagi lub zgłoszenia).";

  const emptyMessage =
    queueTab === "posts"
      ? "Brak postów wymagających uwagi."
      : "Brak komentarzy wymagających uwagi.";

  return (
    <div className="w-full flex flex-col p-10 gap-10">
      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-text-main text-xl font-semibold">
          Panel Moderatora
        </span>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full p-6 glass-card rounded-2xl border border-primary-neutral-stroke-default max-w-[1300px]">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3 min-w-0 flex-1">
              <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-1 self-start">
                <SelectionTabButton
                  isSelected={queueTab === "posts"}
                  onClick={() => setQueueTab("posts")}
                >
                  Zgłoszone posty
                </SelectionTabButton>
                <SelectionTabButton
                  isSelected={queueTab === "comments"}
                  onClick={() => setQueueTab("comments")}
                >
                  Zgłoszone komentarze
                </SelectionTabButton>
              </div>
              <div>
                <h2 className="text-lg font-Albert_Sans font-semibold">
                  Kolejka oczekujących
                </h2>
                <div className="text-sm text-text-neutral">
                  {queueSubtitle} Załadowano:{" "}
                  <span className="text-fuchsia-400 font-bold">
                    {loadedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => refetch()}
                text="Odśwież"
                size="sm"
                isLoading={isFetching}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-text-neutral animate-pulse">
              Ładowanie zgłoszeń...
            </div>
          ) : isError ? (
            <div className="py-6 text-center text-red-500">
              Błąd podczas pobierania zgłoszeń
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              {data?.pages[0]?.length === 0 && (
                <div className="text-center text-text-neutral py-20 bg-white/5 rounded-xl border border-dashed border-secondary-neutral-background-default">
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
                  <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {!hasNextPage &&
                data &&
                data.pages.length > 0 &&
                data.pages[0].length > 0 && (
                  <div className="text-center text-text-neutral text-sm py-8 font-Albert_Sans opacity-50">
                    To już wszystko na dziś
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
