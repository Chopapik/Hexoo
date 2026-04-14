import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PublicCommentResponseDto,
  UpdateCommentRequestDto,
} from "../types/comment.dto";
import toast from "react-hot-toast";

export default function useEditComment(
  commentId: string,
  postId: string,
  successCallBack?: () => void,
  errorCallBack?: (error?: Error) => void,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateCommentRequestDto) => {
      return await fetchClient.put<PublicCommentResponseDto>(
        `/comments/${commentId}`,
        data,
      );
    },

    onSuccess: async () => {
      toast.success("Komentarz został zaktualizowany!");

      await queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
      successCallBack?.();
    },

    onError: (error) => {
      toast.error("Nie udało się zaktualizować komentarza.");
      errorCallBack?.(error);
    },
  });

  return {
    editComment: mutation.mutate,
    isPending: mutation.isPending,
  };
}
