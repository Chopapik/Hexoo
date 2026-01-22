import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";

type Args = { uid: string };

export default function useBlockUser() {
  const m = useMutation({
    mutationFn: async ({ uid }: Args) => {
      return await fetchClient.put(`/admin/user/${uid}/block`);
    },
  });

  return {
    blockUser: m.mutate,
    isPending: m.isPending,
  };
}
