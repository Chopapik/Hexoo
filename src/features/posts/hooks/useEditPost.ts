import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicPostResponseDto, UpdatePostRequestDto } from "../types/post.dto";
import toast from "react-hot-toast";

export default function useEditPost(
  postId: string,
  successCallBack?: () => void,
  errorCallBack?: (error?: Error) => void,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData: UpdatePostRequestDto | FormData) => {
      return await fetchClient.put<PublicPostResponseDto>(
        `/posts/${postId}`,
        postData,
      );
    },

    onSuccess: async () => {
      toast.success("Post został zaktualizowany!");

      await queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      successCallBack?.();
    },

    onError: (error) => {
      errorCallBack?.(error);
    },
  });

  return {
    editPost: mutation.mutate,
    isPending: mutation.isPending,
  };
}
