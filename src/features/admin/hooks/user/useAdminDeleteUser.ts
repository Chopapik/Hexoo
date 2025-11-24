import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
// import { toast } from "react-hot-toast";

export default function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (uid: string) => {
      const res = await axiosInstance.delete(`/admin/user/${uid}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "allUsers"] });
      //   toast.success("Użytkownik został usunięty");
    },
    onError: (error) => {
      //   toast.error("Nie udało się usunąć użytkownika");
    },
  });

  return {
    adminDeleteUser: mutation.mutate,
    isPending: mutation.isPending,
  };
}
