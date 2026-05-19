import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import {
  AddCommentRequestDto,
  AddCommentResponseDto,
} from "../types/comment.dto";
import toast from "react-hot-toast";
import { parseCommentErrorMessages } from "../utils/commentErrorMap";
import { ApiError } from "@/lib/AppError";
import { useAppStore } from "@/lib/store/store";
import { useI18n } from "@/i18n/useI18n";

const MODERATION_TOAST_DURATION = 7000;

export default function useAddComment(
  onSuccessCallback?: () => void,
  onErrorCallback?: (errorCode: string) => void,
) {
  const { lang, t } = useI18n();
  const queryClient = useQueryClient();
  const showNSFWComments = useAppStore((s) => s.settings.showNSFWComments);

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
        toast.success(t("comment.toast.pending"), {
          duration: MODERATION_TOAST_DURATION,
        });
      } else if (result?.isNSFW) {
        if (showNSFWComments) {
          toast.success(t("comment.toast.added"));
        } else {
          toast.success(t("comment.toast.nsfw"), {
            duration: MODERATION_TOAST_DURATION,
          });
        }
      } else {
        toast.success(t("comment.toast.added"));
      }

      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      onSuccessCallback?.();
    },
    onError: (error: ApiError) => {
      const code = error.code;

      const parsedError = parseCommentErrorMessages(code, lang);

      if (parsedError && onErrorCallback) {
        if (code) {
          onErrorCallback(code);
        } else {
          toast.error(t("comment.toast.addError"));
        }
      }
    },
  });

  return {
    addComment: mutation.mutate,
    isPending: mutation.isPending,
  };
}
