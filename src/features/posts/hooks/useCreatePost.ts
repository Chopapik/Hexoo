import axiosInstance from "@/lib/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePost } from "../types/post.type";

export default function useCreatePost(
  successCallBack?: (data?: any) => void,
  errorCallBack?: (error?: any) => void
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData: CreatePost | FormData) => {
      if (postData instanceof FormData) {
        const res = await axiosInstance.post("/posts", postData, {
          withCredentials: true,
          headers: { "Content-Type": undefined },
        });
        return res.data;
      }

      const res = await axiosInstance.post("/posts", postData, {
        withCredentials: true,
      });
      return res.data;
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
