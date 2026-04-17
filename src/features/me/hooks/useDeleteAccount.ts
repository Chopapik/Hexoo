import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import fetchClient from "@/lib/fetchClient";

export const useDeleteAccount = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetchClient.delete(`/me`);
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Nie udało się usunąć konta. Spróbuj ponownie.");
    },
  });

  return {
    deleteAccount: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
