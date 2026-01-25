import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreatePostDto } from "../types/post.dto";

export default function useCreatePost(
  successCallBack?: (data?: any) => void,
  errorCallBack?: (error?: any) => void,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData: CreatePostDto | FormData) => {
      return await fetchClient.post("/posts", postData);
    },

    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      successCallBack?.(data);
    },

    onError: (error) => {
      errorCallBack?.(error);
    },
  });

  return {
    createPost: mutation.mutate,
    isPending: mutation.isPending,
  };
}
