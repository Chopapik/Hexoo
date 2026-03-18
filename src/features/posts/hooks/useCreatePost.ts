import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreatePostDto, CreatePostResultDto } from "../types/post.dto";
import toast from "react-hot-toast";
import { useAppSelector } from "@/lib/store/hooks";

const MODERATION_TOAST_DURATION = 7000;

export default function useCreatePost(
  successCallBack?: (data?: any) => void,
  errorCallBack?: (error?: any) => void,
) {
  const queryClient = useQueryClient();
  const showNSFWPosts = useAppSelector(
    (state) => state.settings.showNSFWPosts,
  );

  const mutation = useMutation({
    mutationFn: async (postData: CreatePostDto | FormData) => {
      return await fetchClient.post<CreatePostResultDto>("/posts", postData);
    },

    onSuccess: async (data) => {
      if (data?.isPending) {
        toast.success("Post dodany i czeka na weryfikację moderacji.", {
          duration: MODERATION_TOAST_DURATION,
        });
      } else if (data?.isNSFW) {
        if (showNSFWPosts) {
          toast.success("Post dodany!");
        } else {
          toast.success(
            "Post dodany jako NSFW. W feedzie będzie oznaczony jako treść dla dorosłych.",
            { duration: MODERATION_TOAST_DURATION },
          );
        }
      } else {
        toast.success("Post dodany!");
      }

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
