import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { useAppStore } from "@/lib/store/store";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/AppError";
import toast from "react-hot-toast";
import type { SessionData } from "@/features/me/me.type";

type ErrorCallback = (errorCode: string, field?: string) => void;

interface UpdateProfileParams {
  name?: string;
  avatarFile?: File;
}

export default function useUpdateProfile(onError?: ErrorCallback) {
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

        const previousName = windowUser.name;
        const nameChanged = updatedProfile.name !== previousName;

        if (nameChanged) {
          router.push(`/profile/${updatedProfile.name}`);
        } else {
          await queryClient.invalidateQueries({
            queryKey: ["profile", updatedProfile.name],
          });
        }

        const uid = updatedProfile.uid || windowUser.uid;
        if (uid) {
          await queryClient.invalidateQueries({
            queryKey: ["posts", "user", uid],
          });
        }

        toast.success("Profil został zaktualizowany!");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        const errorCode = error.code;

        if (errorCode === "CONFLICT") {
          onError?.(errorCode, "name");
        } else if (errorCode === "POLICY_VIOLATION") {
          onError?.(errorCode, "root");
        } else if (errorCode === "VALIDATION_ERROR") {
          const details = error.details as Record<string, string[]> | undefined;
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
        toast.error("Wystąpił nieoczekiwany błąd");
      }
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
