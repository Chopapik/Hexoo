import axiosInstance from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "../types/post.type";

export default function usePosts(limit = 20) {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      // The axiosInstance interceptor unwraps the response data if ok: true
      const res = await axiosInstance.get<Post[]>(`/posts?limit=${limit}`);
      return res.data;
    },
  });
}
