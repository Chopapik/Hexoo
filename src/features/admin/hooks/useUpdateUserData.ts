import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import type { UserDataUpdate } from "@/features/users/types/user.type";

type UpdateUserArgs = {
  uid: string;
  data: UserDataUpdate;
};

export default function useUpdateUserData() {
  const updateMutation = useMutation({
    mutationFn: async ({ uid, data }: UpdateUserArgs) => {
      const res = await axiosInstance.put(`/admin/updateUserData/${uid}`, data);
      return res.data;
    },
  });

  return {
    updateUserData: updateMutation.mutate,
    isPending: updateMutation.isPending,
  };
}
