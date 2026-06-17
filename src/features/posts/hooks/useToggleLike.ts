import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PublicPostResponseDto } from "../types/post.dto";
import { useI18n } from "@/i18n/useI18n";

export function useToggleLike() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      await fetchClient.post(`/posts/${postId}/like`);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });
      const previousPosts = queryClient.getQueryData(queryKeys.posts.all);

      queryClient.setQueryData(
        queryKeys.posts.all,
        (oldData: InfiniteData<PublicPostResponseDto[]> | undefined) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map((page) => {
            return page.map((post) => {
              if (post.id === postId) {
                const wasLiked = post.isLikedByMe;

                return {
                  ...post,
                  isLikedByMe: !wasLiked,
                  likesCount: wasLiked
                    ? post.likesCount - 1
                    : post.likesCount + 1,
                };
              }
              return post;
            });
          });
          return {
            ...oldData,
            pages: newPages,
          };
        },
      );
      return { previousPosts };
    },
    onError: (error, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts.all, context.previousPosts);
      }
      toast.error(t("post.toast.likeError"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });

  return {
    toggleLike: likeMutation.mutate,
  };
}
