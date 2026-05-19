import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function useDeletePost(
  postId: string,
  successCallBack?: () => void,
  errorCallBack?: (error?: Error) => void,
) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetchClient.delete(`/posts/${postId}`);
    },

    onSuccess: async () => {
      toast.success(t("post.toast.deleted"));

      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      successCallBack?.();
    },

    onError: (error) => {
      toast.error(t("post.toast.deleteError"));
      errorCallBack?.(error);
    },
  });

  return {
    deletePost: mutation.mutate,
    isPending: mutation.isPending,
  };
}
