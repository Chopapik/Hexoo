import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";

type Args = { uid: string };

export default function useUnblockUser() {
  const m = useMutation({
    mutationFn: async ({ uid }: Args) => {
      return await fetchClient.put(`/admin/user/${uid}/unblock`);
    },
  });

  return {
    unBlockUser: m.mutate,
    isPending: m.isPending,
  };
}
