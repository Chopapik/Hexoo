import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import { PasswordUpdate } from "../me.type";

export const useUpdatePassword = () => {
  const { handleCriticalError } = useCriticalError();

  const mutation = useMutation({
    mutationFn: async (passwordData: PasswordUpdate) => {
      await axiosInstance.put(`/me/password`, passwordData);
    },
    onError: (error) => {
      handleCriticalError(error);
    },
  });

  return {
    updatePassword: mutation.mutate,
    isPending: mutation.isPending,
  };
};
