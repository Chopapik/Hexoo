import { useInfiniteQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import type { Post } from "@/features/posts/types/post.type";

export default function useUserPosts(userId: string) {
  return useInfiniteQuery<Post[]>({
    queryKey: ["posts", "user", userId],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: "20" });
      if (pageParam) params.append("startAfter", pageParam as string);

      return await fetchClient.get<Post[]>(
        `/posts/user/${userId}?${params.toString()}`
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
