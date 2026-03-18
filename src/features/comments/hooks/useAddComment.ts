import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import {
  AddCommentRequestDto,
  AddCommentResponseDto,
} from "../types/comment.dto";
import toast from "react-hot-toast";
import { parseCommentErrorMessages } from "../utils/commentErrorMap";
import { ApiError } from "@/lib/AppError";
import { useAppSelector } from "@/lib/store/hooks";

const MODERATION_TOAST_DURATION = 7000;

export default function useAddComment(
  onSuccessCallback?: () => void,
  onErrorCallback?: (errorCode: string) => void,
) {
  const queryClient = useQueryClient();
  const showNSFWComments = useAppSelector(
    (state) => state.settings.showNSFWComments,
  );

  const mutation = useMutation({
    mutationFn: async (data: AddCommentRequestDto | FormData) => {
      const postId =
        data instanceof FormData
          ? String(data.get("postId") || "")
          : String(data.postId || "");
      return await fetchClient.post<AddCommentResponseDto>(
        `/posts/${postId}/comments`,
        data,
      );
    },
    onSuccess: (result, variables) => {
      const postId =
        variables instanceof FormData
          ? String(variables.get("postId") || "")
          : String(variables.postId || "");
      if (result?.isPending) {
        toast.success("Komentarz dodany i czeka na weryfikację moderacji.", {
          duration: MODERATION_TOAST_DURATION,
        });
      } else if (result?.isNSFW) {
        if (showNSFWComments) {
          toast.success("Komentarz dodany!");
        } else {
          toast.success(
            "Komentarz dodany jako NSFW. Nie będzie widoczny na liście komentarzy przy obecnych ustawieniach.",
            {
              duration: MODERATION_TOAST_DURATION,
            },
          );
        }
      } else {
        toast.success("Komentarz dodany!");
      }

      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
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
