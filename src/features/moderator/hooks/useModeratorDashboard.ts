"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
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
      const res = await axiosInstance.get("/moderator/queue");
      return res.data.posts;
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (payload: {
      postId: string;
      action: "approve" | "reject" | "quarantine";
      banAuthor?: boolean;
    }) => {
      return axiosInstance.post("/moderator/review", payload);
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
