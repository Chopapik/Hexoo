import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

type Args = { uid: string };

export default function useBlockUser() {
  const m = useMutation({
    mutationFn: async ({ uid }: Args) => {
      const res = await axiosInstance.put(`/admin/user/${uid}/block`);
      return res.data;
    },
  });

  return {
    blockUser: m.mutate,
    isPending: m.isPending,
  };
}
