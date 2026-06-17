import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { toast } from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function useAdminDeleteUser() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (uid: string) => {
      return await fetchClient.delete(`/admin/user/${uid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "allUsers"] });
      toast.success(t("admin.userDeleted"));
    },
    onError: () => {
      toast.error(t("admin.userDeleteError"));
    },
  });

  return {
    adminDeleteUser: mutation.mutate,
    isPending: mutation.isPending,
  };
}
