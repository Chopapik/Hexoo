import { useMutation } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";

type UpdatePasswordArgs = {
  uid: string;
  newPassword: string;
};

export default function useAdminUpdateUserPassword() {
  const passwordMutation = useMutation({
    mutationFn: async ({ uid, newPassword }: UpdatePasswordArgs) => {
      return await fetchClient.put(`/admin/user/${uid}/password`, {
        newPassword,
      });
    },
  });

  return {
    adminUpdateUserPassword: passwordMutation.mutate,
    isPending: passwordMutation.isPending,
  };
}
