import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
import { CommentReportRequestDto } from "../types/comment.dto";

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
      const code = error?.code;

      switch (code) {
        case "CONFLICT":
          toast.error("Już zgłosiłeś ten komentarz.");
          break;
        case "RATE_LIMIT":
          toast.error("Zbyt wiele zgłoszeń. Zwolnij.");
          break;
        case "NOT_FOUND":
          toast.error("Ten komentarz już nie istnieje.");
          break;
        default:
          toast.error("Wystąpił błąd podczas wysyłania zgłoszenia.");
      }
    },
  });
}
