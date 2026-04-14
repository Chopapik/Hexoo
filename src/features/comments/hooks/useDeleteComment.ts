import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function useDeleteComment(
  commentId: string,
  postId: string,
  successCallBack?: () => void,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetchClient.delete(`/comments/${commentId}`);
    },

    onSuccess: async () => {
      toast.success("Komentarz został usunięty.");

      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      successCallBack?.();
    },

    onError: () => {
      toast.error("Nie udało się usunąć komentarza.");
    },
  });

  return {
    deleteComment: mutation.mutate,
    isPending: mutation.isPending,
  };
}
