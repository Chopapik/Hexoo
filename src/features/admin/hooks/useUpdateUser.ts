import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import type { UserDataUpdate } from "@/features/users/types/user.type";

type UpdateUserArgs = {
  uid: string;
  data: UserDataUpdate;
};

export default function useUpdateUser() {
  const updateMutation = useMutation({
    mutationFn: async ({ uid, data }: UpdateUserArgs) => {
      const res = await axiosInstance.put(`/admin/updateUser/${uid}`, data);
      return res.data;
    },
  });

  return {
    updateUser: updateMutation.mutate,
    isPending: updateMutation.isPending,
  };
}
