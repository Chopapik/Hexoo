import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import type { UserDataUpdate } from "@/features/users/types/user.type";

type UpdateUserArgs = {
  uid: string;
  data: UserDataUpdate;
};

export default function useAdminUpdateUserAccount() {
  const updateMutation = useMutation({
    mutationFn: async ({ uid, data }: UpdateUserArgs) => {
      const res = await axiosInstance.put(`/admin/user/${uid}/profile`, data);

      return res.data;
    },
  });

  return {
    adminUpdateUserAccount: updateMutation.mutate,
    isPending: updateMutation.isPending,
  };
}
