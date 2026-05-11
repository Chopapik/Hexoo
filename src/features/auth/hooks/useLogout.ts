import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import fetchClient from "@/lib/fetchClient";
import { useAppStore } from "@/lib/store/store";

export function useLogout() {
  const router = useRouter();
  const clearUser = useAppStore((s) => s.clearUser);

  const mutation = useMutation({
    mutationFn: async () => {
      await fetchClient.post("/auth/logout");
    },

    onMutate: () => {
      clearUser();
    },

    onSuccess: () => {
      router.replace("/login");
      router.refresh();
    },

    onError: (error) => {
      console.error("Logout cleanup failed", error);

      toast.error(
        "Wylogowano lokalnie, ale nie udało się potwierdzić wylogowania na serwerze. Odśwież stronę, jeśli problem wróci.",
      );
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
