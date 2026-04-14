import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function useDeletePost(
  postId: string,
  successCallBack?: () => void,
  errorCallBack?: (error?: Error) => void,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetchClient.delete(`/posts/${postId}`);
    },

    onSuccess: async () => {
      toast.success("Post został usunięty.");

      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      successCallBack?.();
    },

    onError: (error) => {
      toast.error("Nie udało się usunąć posta.");
      errorCallBack?.(error);
    },
  });

  return {
    deletePost: mutation.mutate,
    isPending: mutation.isPending,
  };
}
