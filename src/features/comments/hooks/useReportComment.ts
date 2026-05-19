import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import { CommentReportRequestDto } from "../types/comment.dto";
import { translateError } from "@/i18n/errorCatalog";
import { useI18n } from "@/i18n/useI18n";

export default function useReportComment(onSuccessCallback?: () => void) {
  const { lang, t } = useI18n();
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
      toast.success(t("post.toast.reportSent"));
      onSuccessCallback?.();
    },
    onError: (error: ApiError) => {
      toast.error(translateError(error?.code, lang));
    },
  });
}
