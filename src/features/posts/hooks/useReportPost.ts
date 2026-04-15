import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import { translateError } from "@/i18n/errorCatalog";

interface ReportPostPayload {
  postId: string;
  reason: string;
  details?: string;
}

export default function useReportPost(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: async ({ postId, reason, details }: ReportPostPayload) => {
      await fetchClient.post(`/posts/${postId}/report`, { reason, details });
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
