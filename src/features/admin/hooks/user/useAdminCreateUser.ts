import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import type { AdminUserCreate } from "../../types/admin.type";
export default function useCreateUser() {
  const m = useMutation({
    mutationFn: async (userData: AdminUserCreate) => {
      const res = await axiosInstance.post(`/admin/user`, userData);
      return res.data;
    },
  });

  return {
    createUser: m.mutate,
    isPending: m.isPending,
  };
}
