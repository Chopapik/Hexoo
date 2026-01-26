import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import type { UpdateUserDto } from "@/features/users/types/user.dto";

type UpdateUserArgs = {
  uid: string;
  data: UpdateUserDto;
};

export default function useAdminUpdateUserAccount() {
  const updateMutation = useMutation({
    mutationFn: async ({ uid, data }: UpdateUserArgs) => {
      return await fetchClient.put(`/admin/user/${uid}/profile`, data);
    },
  });

  return {
    adminUpdateUserAccount: updateMutation.mutate,
    isPending: updateMutation.isPending,
  };
}
