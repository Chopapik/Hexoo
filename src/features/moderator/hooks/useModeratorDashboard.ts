"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import type { ModerationPostResponseDto } from "@/features/posts/types/post.dto";

export function useModeratorDashboard() {
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
    queryKey: ["moderator", "queue"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: "20",
      });

      if (pageParam) {
        params.append("startAfter", pageParam as string);
      }

      const res = await fetchClient.get<{ posts: ModerationPostResponseDto[] }>(
        `/moderator/queue?${params.toString()}`,
      );
      return res.posts;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 1,
  });

  const actionMutation = useMutation({
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

  return {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    performAction: actionMutation.mutate,
    isActionPending: actionMutation.isPending,
  };
}
