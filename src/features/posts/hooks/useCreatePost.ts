import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreatePostRequestDto,
  CreatePostResponseDto,
} from "../types/post.dto";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/store/store";

const MODERATION_TOAST_DURATION = 7000;

export default function useCreatePost(
  successCallBack?: (data?: CreatePostResponseDto) => void,
  errorCallBack?: (error?: Error) => void,
) {
  const queryClient = useQueryClient();
  const showNSFWPosts = useAppStore((s) => s.settings.showNSFWPosts);

  const mutation = useMutation({
    mutationFn: async (postData: CreatePostRequestDto | FormData) => {
      return await fetchClient.post<CreatePostResponseDto>("/posts", postData);
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
