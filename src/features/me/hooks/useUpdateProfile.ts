import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { UpdateProfileData } from "../me.type";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/features/auth/store/authSlice";

export default function useUpdateProfile() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await axiosInstance.put(`/me/profile`, data);
      return response.data;
    },
    onSuccess: (response) => {
      const updatedUser = response.data;

      if (updatedUser) {
        dispatch(setUser(updatedUser));
      }

      router.push(`/${updatedUser.name}`);
    },
  });

  return {
    updateProfile: mutation.mutate,
    isPending: mutation.isPending,
  };
}
