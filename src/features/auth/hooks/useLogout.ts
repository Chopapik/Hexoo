import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import fetchClient from "@/lib/fetchClient";
import { useAppStore } from "@/lib/store/store";
import { useI18n } from "@/i18n/useI18n";

export function useLogout() {
  const { t } = useI18n();
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

      toast.error(t("auth.logout.partialError"));
    },
  });

  return {
    logout: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
