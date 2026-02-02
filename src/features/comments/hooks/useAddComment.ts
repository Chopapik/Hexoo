import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { AddCommentDto } from "../types/comment.dto";
import toast from "react-hot-toast";
import { parseCommentErrorMessages } from "../utils/commentFormValidation";
import { ApiError } from "@/lib/AppError";

export default function useAddComment(
  onSuccessCallback?: () => void,
  onErrorCallback?: (errorCode: string) => void
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: AddCommentDto) => {
      return await fetchClient.post(`/posts/${data.postId}/comments`, data);
    },
    onSuccess: (_, variables) => {
      toast.success("Komentarz dodany!");

      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      onSuccessCallback?.();
    },
    onError: (error: ApiError) => {
      const code = error.code;

      const parsedError = parseCommentErrorMessages(code);

      if (parsedError && onErrorCallback) {
        if (code) {
          onErrorCallback(code);
        } else {
          toast.error("Nie udało się dodać komentarza.");
        }
      }
    },
  });

  return {
    addComment: mutation.mutate,
    isPending: mutation.isPending,
  };
}
