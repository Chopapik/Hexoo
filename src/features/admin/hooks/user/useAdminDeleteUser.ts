import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { toast } from "react-hot-toast";

export default function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (uid: string) => {
      return await fetchClient.delete(`/admin/user/${uid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "allUsers"] });
      toast.success("Użytkownik został usunięty");
    },
    onError: (error) => {
      toast.error("Nie udało się usunąć użytkownika");
    },
  });

  return {
    adminDeleteUser: mutation.mutate,
    isPending: mutation.isPending,
  };
}
