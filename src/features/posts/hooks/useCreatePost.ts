import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreatePostRequestDto,
  CreatePostResponseDto,
} from "../types/post.dto";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/store/store";
import { useI18n } from "@/i18n/useI18n";

const MODERATION_TOAST_DURATION = 7000;

export default function useCreatePost(
  successCallBack?: (data?: CreatePostResponseDto) => void,
  errorCallBack?: (error?: Error) => void,
) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const showNSFWPosts = useAppStore((s) => s.settings.showNSFWPosts);

  const mutation = useMutation({
    mutationFn: async (postData: CreatePostRequestDto | FormData) => {
      return await fetchClient.post<CreatePostResponseDto>("/posts", postData);
    },

    onSuccess: async (data) => {
      if (data?.isPending) {
        toast.success(t("post.toast.pending"), {
          duration: MODERATION_TOAST_DURATION,
        });
      } else if (data?.isNSFW) {
        if (showNSFWPosts) {
          toast.success(t("post.toast.created"));
        } else {
          toast.success(t("post.toast.nsfw"), {
            duration: MODERATION_TOAST_DURATION,
          });
        }
      } else {
        toast.success(t("post.toast.created"));
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
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
