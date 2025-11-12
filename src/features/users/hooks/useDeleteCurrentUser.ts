import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useCriticalError } from "@/features/shared/hooks/useCriticalError";
import { useRouter } from "next/navigation";

export const useDeleteCurrentUser = () => {
  const { handleCriticalError } = useCriticalError();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      console.log("robie");
      const response = await axiosInstance.delete(`/user/deleteCurrentUser`);
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
    deleteCurrentUser: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
