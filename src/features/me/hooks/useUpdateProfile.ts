import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";
import { UpdateProfileData } from "../me.type";

export default function useUpdateProfile() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await axiosInstance.put(`/me/profile`, data);
      return response.data;
    },
    onSuccess: (response) => {
      router.push(`/${response.newData.name}`);
    },
  });

  return {
    updateProfile: mutation.mutate,
    isPending: mutation.isPending,
  };
}
