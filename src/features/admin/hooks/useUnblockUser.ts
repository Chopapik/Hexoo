import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

type Args = { uid: string };

export default function useUnblockUser() {
  const m = useMutation({
    mutationFn: async ({ uid }: Args) => {
      const res = await axiosInstance.put(`/admin/unblockUser/${uid}`);
      return res.data;
    },
  });

  return {
    unBlockUser: m.mutate,
    isPending: m.isPending,
  };
}
