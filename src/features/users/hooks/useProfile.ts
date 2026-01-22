import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/features/users/types/user.type";
import fetchClient from "@/lib/fetchClient";

export default function useProfile(name: string, initialData?: UserProfile) {
  const query = useQuery({
    queryKey: ["profile", name],
    retry: false,
    initialData: initialData,
    staleTime: 1000 * 60 * 5,

    queryFn: async ({ signal }) => {
      const response = await fetchClient.get<{ user: UserProfile }>(
        `/user/profile/${name}`,
        { signal }
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
