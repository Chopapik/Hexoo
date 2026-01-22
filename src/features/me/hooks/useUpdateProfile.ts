import { useMutation, useQueryClient } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/features/auth/store/authSlice";
import { useRouter } from "next/navigation";

interface UpdateProfileParams {
  name?: string;
  avatarFile?: File;
}

export default function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const windowUser = useAppSelector((state) => state.auth.user);

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileParams) => {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.avatarFile) formData.append("avatarFile", data.avatarFile);

      return await fetchClient.put<{ data: any }>(`/me/profile`, formData);
    },
    onSuccess: (response) => {
      const updatedUser = response.data;
      if (updatedUser) {
        if (windowUser && updatedUser.name !== windowUser.name) {
          router.push(`/profile/${updatedUser.name}`);
        } else {
          router.push(`/profile/${updatedUser.name}`);
          queryClient.invalidateQueries({
            queryKey: ["profile", windowUser?.name],
          });
        }
        dispatch(setUser(updatedUser));
      }
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
