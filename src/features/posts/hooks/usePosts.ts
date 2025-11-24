import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import type { Post } from "../types/post.type";

type GetPostsResponse = Post[];

export default function usePosts() {
  return useInfiniteQuery<GetPostsResponse>({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        limit: "5",
      });

      if (pageParam) {
        params.append("startAfter", pageParam as string);
      }

      const { data } = await axiosInstance.get(`/posts?${params.toString()}`);
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].id;
    },
    staleTime: 1000 * 60 * 1,
  });
}
