"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";

export function useModeratorDashboard() {
  const queryClient = useQueryClient();

  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["moderator", "queue"],
    queryFn: async () => {
      const res = await fetchClient.get<{ posts: any[] }>("/moderator/queue");
      return res.posts;
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (payload: {
      postId: string;
      action: "approve" | "reject" | "quarantine";
      banAuthor?: boolean;
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
    posts,
    isLoading,
    isError,
    performAction: actionMutation.mutate,
    isActionPending: actionMutation.isPending,
  };
}
