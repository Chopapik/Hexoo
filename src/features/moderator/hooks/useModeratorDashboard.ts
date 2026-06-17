"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import toast from "react-hot-toast";
import type { ModerationPostResponseDto } from "@/features/posts/types/post.dto";
import type { ModerationCommentResponseDto } from "@/features/comments/types/comment.dto";
import { useI18n } from "@/i18n/useI18n";

export type ModeratorQueueTab = "posts" | "comments";

export function useModeratorDashboard(queueTab: ModeratorQueueTab) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.moderator.queue.byTab(queueTab),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: "20",
      });

      if (pageParam) {
        params.append("startAfter", pageParam as string);
      }

      const qs = params.toString();

      if (queueTab === "posts") {
        const res = await fetchClient.get<{
          posts: ModerationPostResponseDto[];
        }>(`/moderator/queue/posts?${qs}`);
        return res.posts;
      }

      const res = await fetchClient.get<{
        comments: ModerationCommentResponseDto[];
      }>(`/moderator/queue/comments?${qs}`);
      return res.comments;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 1,
  });

  const postMutation = useMutation({
    mutationFn: async (payload: {
      postId: string;
      action: "approve" | "reject" | "quarantine";
      banAuthor?: boolean;
      justification?: string;
      categories?: string[];
    }) => {
      return fetchClient.post("/moderator/review", payload);
    },
    onSuccess: (_, variables) => {
      const messages = {
        approve: t("moderation.toast.postApproved"),
        reject: t("moderation.toast.postRejected"),
        quarantine: t("moderation.toast.postQuarantined"),
      };
      toast.success(messages[variables.action]);

      queryClient.invalidateQueries({ queryKey: queryKeys.moderator.queue.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: () => toast.error(t("moderation.toast.error")),
  });

  const commentMutation = useMutation({
    mutationFn: async (payload: {
      commentId: string;
      action: "approve" | "reject" | "quarantine";
      banAuthor?: boolean;
      justification?: string;
      categories?: string[];
    }) => {
      return fetchClient.post("/moderator/review-comment", payload);
    },
    onSuccess: (_, variables) => {
      const messages = {
        approve: t("moderation.toast.commentApproved"),
        reject: t("moderation.toast.commentRejected"),
        quarantine: t("moderation.toast.commentQuarantined"),
      };
      toast.success(messages[variables.action]);

      queryClient.invalidateQueries({ queryKey: queryKeys.moderator.queue.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
    onError: () => toast.error(t("moderation.toast.error")),
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    performPostAction: postMutation.mutate,
    performCommentAction: commentMutation.mutate,
    isActionPending:
      postMutation.isPending || commentMutation.isPending,
  };
}
