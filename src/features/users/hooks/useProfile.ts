import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/features/users/types/user.type";
import axiosInstance from "@/lib/axiosInstance";

export default function useProfile(name: string, initialData?: UserProfile) {
  const query = useQuery({
    queryKey: ["profile", name],
    retry: false,
    initialData: initialData,
    staleTime: 1000 * 60 * 5,

    queryFn: async ({ signal }) => {
      const response = await axiosInstance.get(`/user/profile/${name}`, {
        signal,
      });

      return response.data.user;
    },
  });

  return {
    userProfileData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
