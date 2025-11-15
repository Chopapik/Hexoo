import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

type UpdatePasswordArgs = {
  uid: string;
  newPassword: string;
};

export default function useAdminUpdateUserPassword() {
  const passwordMutation = useMutation({
    mutationFn: async ({ uid, newPassword }: UpdatePasswordArgs) => {
      const res = await axiosInstance.put(`/admin/user/${uid}/password`, {
        newPassword,
      });
      return res.data;
    },
  });

  return {
    adminUpdateUserPassword: passwordMutation.mutate,
    isPending: passwordMutation.isPending,
  };
}
