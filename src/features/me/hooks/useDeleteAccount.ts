import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import { useRouter } from "next/navigation";

export const useDeleteAccount = () => {
  const { handleCriticalError } = useCriticalError();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetchClient.delete(`/me`);
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
