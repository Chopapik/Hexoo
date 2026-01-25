import { useInfiniteQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import { PostResponseDto } from "../types/post.dto";

export default function usePosts() {
  return useInfiniteQuery<PostResponseDto[]>({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: "20",
      });

      if (pageParam) {
        params.append("startAfter", pageParam as string);
      }

      return await fetchClient.get<PostResponseDto[]>(
        `/posts?${params.toString()}`,
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 1,
  });
}
