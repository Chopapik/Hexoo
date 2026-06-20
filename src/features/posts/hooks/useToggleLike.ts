import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import type { SetLikeStateResponseDto } from "@/features/likes/types/like.dto";
import type { PublicPostResponseDto } from "../types/post.dto";
import {
  type InfiniteData,
  type QueryKey,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useI18n } from "@/i18n/useI18n";

type CacheSnapshot = [QueryKey, unknown];

type LikeWriteState = {
  latestLiked: boolean;
  lastSentLiked?: boolean;
  snapshots: CacheSnapshot[];
  timer?: ReturnType<typeof setTimeout>;
  isSending: boolean;
};

const LIKE_WRITE_DEBOUNCE_MS = 250;
const likeWritesByPostId = new Map<string, LikeWriteState>();

function updatePost(
  post: PublicPostResponseDto,
  postId: string,
  liked: boolean,
  authoritativeCount?: number,
): PublicPostResponseDto {
  if (post.id !== postId) return post;

  const wasLiked = Boolean(post.isLikedByMe);
  const optimisticCount =
    wasLiked === liked
      ? post.likesCount
      : Math.max(0, post.likesCount + (liked ? 1 : -1));

  return {
    ...post,
    isLikedByMe: liked,
    likesCount: authoritativeCount ?? optimisticCount,
  };
}

function updatePostCache(
  cached: unknown,
  postId: string,
  liked: boolean,
  authoritativeCount?: number,
): unknown {
  if (!cached || typeof cached !== "object") return cached;

  if ("pages" in cached && Array.isArray(cached.pages)) {
    const infinite = cached as InfiniteData<PublicPostResponseDto[]>;

    return {
      ...infinite,
      pages: infinite.pages.map((page) =>
        page.map((post) => updatePost(post, postId, liked, authoritativeCount)),
      ),
    };
  }

  if ("id" in cached) {
    return updatePost(
      cached as PublicPostResponseDto,
      postId,
      liked,
      authoritativeCount,
    );
  }

  return cached;
}

export function useToggleLike() {
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const getPostCacheSnapshots = (): CacheSnapshot[] =>
    queryClient.getQueriesData({
      queryKey: queryKeys.posts.all,
    }) as CacheSnapshot[];

  const updateAllPostCaches = (
    postId: string,
    liked: boolean,
    authoritativeCount?: number,
  ) => {
    for (const [queryKey] of queryClient.getQueriesData({
      queryKey: queryKeys.posts.all,
    })) {
      queryClient.setQueryData(queryKey, (cached: unknown) =>
        updatePostCache(cached, postId, liked, authoritativeCount),
      );
    }
  };

  const restoreSnapshots = (snapshots: CacheSnapshot[]) => {
    for (const [queryKey, cached] of snapshots) {
      queryClient.setQueryData(queryKey, cached);
    }
  };

  const sendLatestLikeState = async (postId: string, state: LikeWriteState) => {
    if (state.isSending) return;

    state.isSending = true;

    try {
      while (likeWritesByPostId.get(postId) === state) {
        const likedToSend = state.latestLiked;

        if (state.lastSentLiked === likedToSend) {
          break;
        }

        state.lastSentLiked = likedToSend;

        const response = await fetchClient.post<SetLikeStateResponseDto>(
          `/posts/${postId}/like`,
          { liked: likedToSend },
        );

        if (state.latestLiked === likedToSend) {
          updateAllPostCaches(postId, response.liked, response.likesCount);
          break;
        }

        updateAllPostCaches(postId, state.latestLiked);
      }
    } catch {
      restoreSnapshots(state.snapshots);
      toast.error(t("post.toast.likeError"));
    } finally {
      state.isSending = false;

      if (likeWritesByPostId.get(postId) !== state) {
        return;
      }

      if (state.lastSentLiked === state.latestLiked) {
        likeWritesByPostId.delete(postId);
        return;
      }

      scheduleLikeWrite(postId, state);
    }
  };

  const scheduleLikeWrite = (postId: string, state: LikeWriteState) => {
    if (state.timer) {
      clearTimeout(state.timer);
    }

    state.timer = setTimeout(() => {
      state.timer = undefined;
      void sendLatestLikeState(postId, state);
    }, LIKE_WRITE_DEBOUNCE_MS);
  };

  return {
    toggleLike: (postId: string, liked: boolean) => {
      const existingState = likeWritesByPostId.get(postId);

      if (existingState) {
        existingState.latestLiked = liked;
        updateAllPostCaches(postId, liked);
        scheduleLikeWrite(postId, existingState);
        return;
      }

      const nextState: LikeWriteState = {
        latestLiked: liked,
        snapshots: getPostCacheSnapshots(),
        isSending: false,
      };

      likeWritesByPostId.set(postId, nextState);
      updateAllPostCaches(postId, liked);
      scheduleLikeWrite(postId, nextState);
    },
  };
}
