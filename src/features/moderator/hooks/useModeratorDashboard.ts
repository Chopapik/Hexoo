"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import type { ModerationPostResponseDto } from "@/features/posts/types/post.dto";
import type { ModerationCommentResponseDto } from "@/features/comments/types/comment.dto";

export type ModeratorQueueTab = "posts" | "comments";

export function useModeratorDashboard(queueTab: ModeratorQueueTab) {
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
    queryKey: ["moderator", "queue", queueTab],
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
        approve: "Post zatwierdzony",
        reject: "Post usunięty",
        quarantine: "Post przeniesiony do kwarantanny",
      };
      toast.success(messages[variables.action]);

      queryClient.invalidateQueries({ queryKey: ["moderator", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => toast.error("Błąd podczas akcji moderatora"),
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
        approve: "Komentarz zatwierdzony",
        reject: "Komentarz usunięty",
        quarantine: "Komentarz w kwarantannie",
      };
      toast.success(messages[variables.action]);

      queryClient.invalidateQueries({ queryKey: ["moderator", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => toast.error("Błąd podczas akcji moderatora"),
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
