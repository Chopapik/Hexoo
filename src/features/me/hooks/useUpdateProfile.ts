import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/features/auth/store/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/AppError";
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

      const response = await axiosInstance.put(`/me/profile`, formData);
      return response.data;
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
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(
          `Wystąpił błąd podczas aktualizacji profilu: ${error.code}`
        );
      } else {
        toast.error("Wystąpił nieznany błąd podczas aktualizacji profilu");
      }
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
