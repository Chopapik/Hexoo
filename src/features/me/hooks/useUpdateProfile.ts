import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/features/auth/store/authSlice";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/AppError";
import toast from "react-hot-toast";

type ErrorCallback = (errorCode: string, field?: string) => void;

interface UpdateProfileParams {
  name?: string;
  avatarFile?: File;
}

export default function useUpdateProfile(onError?: ErrorCallback) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const windowUser = useAppSelector((state) => state.auth.user);

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileParams) => {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.avatarFile) formData.append("avatarFile", data.avatarFile);

      return await fetchClient.put<{ data: any }>(`/me/profile`, formData);
    },
    onSuccess: (response) => {
      const updatedUser = response.data;
      if (updatedUser) {
        if (windowUser && updatedUser.name !== windowUser.name) {
          router.push(`/profile/${updatedUser.name}`);
        } else {
          router.push(`/profile/${updatedUser.name}`);
          queryClient.invalidateQueries({
            queryKey: ["profile", windowUser?.name],
          });
        }
        dispatch(setUser(updatedUser));
        toast.success("Profil został zaktualizowany!");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        const errorCode = error.code;

        // Handle specific error codes
        if (errorCode === "CONFLICT") {
          onError?.(errorCode, "name");
        } else if (errorCode === "POLICY_VIOLATION") {
          onError?.(errorCode, "root");
        } else if (errorCode === "VALIDATION_ERROR") {
          // Handle Zod validation errors from API
          const details = error.details as Record<string, string[]> | undefined;
          if (details) {
            // Map Zod field errors to form fields
            Object.keys(details).forEach((field) => {
              const messages = details[field];
              if (messages && messages.length > 0) {
                // Use the first error code from Zod
                const zodErrorCode = messages[0];
                onError?.(zodErrorCode, field);
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
