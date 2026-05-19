import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import fetchClient from "@/lib/fetchClient";
import { useI18n } from "@/i18n/useI18n";

export const useDeleteAccount = () => {
  const { t } = useI18n();
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
      toast.error(t("settings.danger.deleteError"));
    },
  });

  return {
    deleteAccount: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
