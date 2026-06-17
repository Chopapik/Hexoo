import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PublicPostResponseDto, UpdatePostRequestDto } from "../types/post.dto";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

export default function useEditPost(
  postId: string,
  successCallBack?: () => void,
  errorCallBack?: (error?: Error) => void,
) {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postData: UpdatePostRequestDto | FormData) => {
      return await fetchClient.put<PublicPostResponseDto>(
        `/posts/${postId}`,
        postData,
      );
    },

    onSuccess: async () => {
      toast.success(t("post.toast.updated"));

      await queryClient.invalidateQueries({
        queryKey: queryKeys.posts.all,
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
