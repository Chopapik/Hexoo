import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import { useRouter } from "next/navigation";

export const useDeleteAccount = () => {
  const { handleCriticalError } = useCriticalError();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`/me`);
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      handleCriticalError(error);
    },
  });

  return {
    deleteAccount: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
