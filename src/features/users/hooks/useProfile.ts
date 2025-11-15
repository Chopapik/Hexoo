import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/features/users/types/user.type";
import axiosInstance from "@/lib/axiosInstance";

export default function useProfile(name: string) {
  const query = useQuery<UserProfile | null, Error>({
    queryKey: ["profile", name],
    // enabled: !!name && name.trim() !== "",
    retry: false,

    queryFn: async ({ signal }) => {
      const response = await axiosInstance.get(`/user/profile/${name}`, {
        signal,
      });

      return response.data;
    },
  });

  return {
    userProfileData: query.data,
  };
}
