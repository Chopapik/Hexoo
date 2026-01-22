import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useLogout() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetchClient.post("/auth/logout");
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed", error);
      toast.error("Wystąpił nieznany bład");
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
