import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PublicCommentResponseDto,
  UpdateCommentRequestDto,
} from "../types/comment.dto";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function useEditComment(
  commentId: string,
  postId: string,
  successCallBack?: () => void,
  errorCallBack?: (error?: Error) => void,
) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateCommentRequestDto) => {
      return await fetchClient.put<PublicCommentResponseDto>(
        `/comments/${commentId}`,
        data,
      );
    },

    onSuccess: async () => {
      toast.success(t("comment.toast.updated"));

      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
      successCallBack?.();
    },

    onError: (error) => {
      toast.error(t("comment.toast.updateError"));
      errorCallBack?.(error);
    },
  });

  return {
    editComment: mutation.mutate,
    isPending: mutation.isPending,
  };
}
