import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import { PostReportDto } from "../types/post.dto";

export default function useReportPost(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: async ({ postId, reason, details }: PostReportDto) => {
      await fetchClient.post(`/posts/${postId}/report`, { reason, details });
    },
    onSuccess: () => {
      toast.success("Zgłoszenie zostało wysłane do weryfikacji.");
      onSuccessCallback?.();
    },
    onError: (error: ApiError) => {
      const code = error?.code;

      switch (code) {
        case "CONFLICT":
          toast.error("Już zgłosiłeś ten post.");
          break;
        case "RATE_LIMIT":
          toast.error("Zbyt wiele zgłoszeń. Zwolnij.");
          break;
        case "NOT_FOUND":
          toast.error("Ten post już nie istnieje.");
          break;
        default:
          toast.error("Wystąpił błąd podczas wysyłania zgłoszenia.");
      }
    },
  });
}
