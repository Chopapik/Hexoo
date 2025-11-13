import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";

type UpdatePasswordArgs = {
  uid: string;
  newPassword: string;
};

export default function useUpdateUserPassword() {
  const passwordMutation = useMutation({
    mutationFn: async ({ uid, newPassword }: UpdatePasswordArgs) => {
      const res = await axiosInstance.put(`/admin/updateUserPassword/${uid}`, {
        newPassword,
      });
      return res.data;
    },
  });

  return {
    updateUserPassword: passwordMutation.mutate,
    isPending: passwordMutation.isPending,
  };
}
