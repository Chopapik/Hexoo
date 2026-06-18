import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { createAppError } from "@/lib/AppError";

type Args = { uid: string; reason: string };

export default function useBlockUser() {
  const m = useMutation({
    mutationFn: async ({ uid, reason }: Args) => {
      if (typeof reason !== "string" || !reason.trim()) {
        throw createAppError({
          code: "VALIDATION_ERROR",
          message: "[useBlockUser] Block reason is required",
        });
      }

      const trimmedReason = reason.trim();

      return await fetchClient.put(`/admin/user/${uid}/block`, {
        reason: trimmedReason,
      });
    },
  });

  return {
    blockUser: m.mutate,
    isPending: m.isPending,
    error: m.error,
  };
}
