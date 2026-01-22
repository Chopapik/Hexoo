import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import type { AdminUserCreate } from "@/features/admin/types/admin.type";

export default function useAdminCreateUser() {
  const m = useMutation({
    mutationFn: async (userData: AdminUserCreate) => {
      return await fetchClient.post(`/admin/user`, userData);
    },
  });

  return {
    createUser: m.mutate,
    isPending: m.isPending,
  };
}
