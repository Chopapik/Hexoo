import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function useDeleteComment(
  commentId: string,
  postId: string,
  successCallBack?: () => void,
) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetchClient.delete(`/comments/${commentId}`);
    },

    onSuccess: async () => {
      toast.success(t("comment.toast.deleted"));

      await queryClient.invalidateQueries({
        queryKey: queryKeys.comments.byPost(postId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
      });
      successCallBack?.();
    },

    onError: () => {
      toast.error(t("comment.toast.deleteError"));
    },
  });

  return {
    deleteComment: mutation.mutate,
    isPending: mutation.isPending,
  };
}
