import fetchClient from "@/lib/fetchClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "../types/post.type";
import toast from "react-hot-toast";

export function useToggleLike() {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      await fetchClient.post(`/posts/${postId}/like`);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page: any) => {
          return page.map((post: Post) => {
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
      });
      return { previousPosts };
    },
    onError: (error, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error("Nie udało się polubić posta");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    toggleLike: likeMutation.mutate,
  };
}
