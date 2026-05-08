import { useQuery } from "@tanstack/react-query";
import type { UserProfileResponseDto } from "@/features/users/types/user.dto";
import fetchClient from "@/lib/fetchClient";

export default function useProfile(
  uid: string,
  initialData?: UserProfileResponseDto,
) {
  const query = useQuery({
    queryKey: ["profile", uid],
    retry: false,
    initialData: initialData,
    staleTime: 1000 * 60 * 5,
    enabled: !!uid,

    queryFn: async ({ signal }) => {
      const response = await fetchClient.get<{ user: UserProfileResponseDto }>(
        `/user/profile/${uid}`,
        { signal },
      );

      return response.user;
    },
  });

  return {
    userProfileData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
