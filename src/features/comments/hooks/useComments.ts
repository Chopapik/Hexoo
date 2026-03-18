import { useQuery } from "@tanstack/react-query";
import fetchClient from "@/lib/fetchClient";
import type { PublicCommentResponseDto } from "../types/comment.dto";

export default function useComments(postId: string, enabled = true) {
  const query = useQuery({
    queryKey: ["comments", postId],
    enabled: Boolean(postId) && enabled,
    queryFn: async ({ signal }) => {
      return fetchClient.get<PublicCommentResponseDto[]>(
        `/posts/${postId}/comments`,
        {
        signal,
        },
      );
    },
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
