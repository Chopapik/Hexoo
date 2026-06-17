import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import { useAppStore } from "@/lib/store/store";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/AppError";
import toast from "react-hot-toast";
import type { SessionData } from "@/features/me/me.type";
import { useI18n } from "@/i18n/useI18n";

type ErrorCallback = (errorCode: string, field?: string) => void;

interface UpdateProfileParams {
  name?: string;
  avatarFile?: File;
}

export default function useUpdateProfile(onError?: ErrorCallback) {
  const { t } = useI18n();
  const setUser = useAppStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  const windowUser = useAppStore((s) => s.auth.user);

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileParams) => {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.avatarFile) formData.append("avatarFile", data.avatarFile);

      return await fetchClient.put<SessionData>(
        `/me/profile`,
        formData,
      );
    },
    onSuccess: async (response) => {
      const updatedProfile = response;

      if (updatedProfile && windowUser) {
        const newSessionData = {
          ...windowUser,
          name: updatedProfile.name,
          avatarUrl: updatedProfile.avatarUrl,
        };

        setUser(newSessionData);

        const uid = updatedProfile.uid || windowUser.uid;

        if (uid) {
          router.push(`/profile/${uid}`);
          await queryClient.invalidateQueries({
            queryKey: queryKeys.profile.byUid(uid),
          });
        }

        if (uid) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.posts.byUser(uid),
          });
        }

        toast.success(t("profile.updated"));
      }
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        const errorCode = error.code;
        const errorData = error.data as Record<string, unknown> | undefined;

        if (errorCode === "CONFLICT") {
          onError?.(errorCode, "name");
        } else if (errorCode === "POLICY_VIOLATION") {
          const sources = Array.isArray(errorData?.source)
            ? errorData.source.filter(
                (source): source is "text" | "image" =>
                  source === "text" || source === "image",
              )
            : [];
          const hasTextViolation = sources.includes("text");
          const hasImageViolation = sources.includes("image");

          if (hasTextViolation && hasImageViolation) {
            onError?.("policy_violation_profile", "root");
          } else if (hasImageViolation) {
            onError?.("policy_violation_avatar", "avatarFile");
          } else if (hasTextViolation) {
            onError?.("policy_violation_name", "name");
          } else {
            onError?.(errorCode, "root");
          }
        } else if (errorCode === "VALIDATION_ERROR") {
          const details = errorData?.details as Record<string, string[]> | undefined;
          if (details) {
            Object.keys(details).forEach((field) => {
              const messages = details[field];
              if (messages && messages.length > 0) {
                onError?.(messages[0], field);
              }
            });
          } else {
            onError?.(errorCode, "root");
          }
        } else {
          onError?.(errorCode, "root");
        }
      } else {
        console.error("Unexpected error:", error);
        toast.error(t("common.unknown"));
      }
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
