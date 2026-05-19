import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import { translateError } from "@/i18n/errorCatalog";
import { useI18n } from "@/i18n/useI18n";

interface ReportPostPayload {
  postId: string;
  reason: string;
  details?: string;
}

export default function useReportPost(onSuccessCallback?: () => void) {
  const { lang, t } = useI18n();
  return useMutation({
    mutationFn: async ({ postId, reason, details }: ReportPostPayload) => {
      await fetchClient.post(`/posts/${postId}/report`, { reason, details });
    },
    onSuccess: () => {
      toast.success(t("post.toast.reportSent"));
      onSuccessCallback?.();
    },
    onError: (error: ApiError) => {
      if (error?.code === "CONFLICT") {
        toast.error(t("post.toast.alreadyReported"));
        return;
      }
      toast.error(translateError(error?.code, lang));
    },
  });
}
