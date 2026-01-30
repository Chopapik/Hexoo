import { useInfiniteQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import type { PublicPostDto } from "@/features/posts/types/post.dto";

export default function useUserPosts(userId: string) {
  return useInfiniteQuery<PublicPostDto[]>({
    queryKey: ["posts", "user", userId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: "20" });
      if (pageParam) params.append("startAfter", pageParam as string);

      return await fetchClient.get<PublicPostDto[]>(
        `/posts/user/${userId}?${params.toString()}`,
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!userId,
  });
}
