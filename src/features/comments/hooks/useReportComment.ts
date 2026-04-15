import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import { CommentReportRequestDto } from "../types/comment.dto";
import { translateError } from "@/i18n/errorCatalog";

export default function useReportComment(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: async ({
      commentId,
      reason,
      details,
    }: CommentReportRequestDto) => {
      await fetchClient.post(`/comments/${commentId}/report`, {
        reason,
        details,
      });
    },
    onSuccess: () => {
      toast.success("Zgłoszenie zostało wysłane do weryfikacji.");
      onSuccessCallback?.();
    },
    onError: (error: ApiError) => {
      toast.error(translateError(error?.code));
    },
  });
}
