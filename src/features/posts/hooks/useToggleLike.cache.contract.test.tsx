/** @vitest-environment jsdom */
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  InfiniteData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import fetchClient from "@/lib/fetchClient";
import { queryKeys } from "@/lib/queryKeys";
import type { PublicPostResponseDto } from "../types/post.dto";
import { useToggleLike } from "./useToggleLike";

vi.mock("@/lib/fetchClient", () => ({
  default: { post: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn() } }));

const post = (overrides: Partial<PublicPostResponseDto> = {}) =>
  ({
    id: "post-1",
    likesCount: 2,
    isLikedByMe: false,
    ...overrides,
  }) as PublicPostResponseDto;

function infinite(value: PublicPostResponseDto): InfiniteData<PublicPostResponseDto[]> {
  return { pages: [[value]], pageParams: [undefined] };
}

function wrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function readPost(client: QueryClient, key: readonly unknown[]) {
  return client.getQueryData<InfiniteData<PublicPostResponseDto[]>>(key)?.pages[0][0];
}

describe("useToggleLike multi-cache contract", () => {
  let client: QueryClient;
  const feedKey = queryKeys.posts.all;
  const ownerKey = queryKeys.posts.byUser("owner-1");
  const viewerKey = queryKeys.posts.byUser("viewer-1");

  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    client.setQueryData(feedKey, infinite(post()));
    client.setQueryData(ownerKey, infinite(post()));
    client.setQueryData(viewerKey, infinite(post()));
  });

  it.each([
    [true, 3],
    [false, 1],
  ] as const)("reconciles liked=%s across feed and every user-post cache", async (liked, likesCount) => {
    const starting = post({ isLikedByMe: !liked, likesCount: liked ? 2 : 2 });
    for (const key of [feedKey, ownerKey, viewerKey]) {
      client.setQueryData(key, infinite(starting));
    }
    vi.mocked(fetchClient.post).mockResolvedValue({ liked, likesCount });
    const { result } = renderHook(() => useToggleLike(), { wrapper: wrapper(client) });

    act(() => result.current.toggleLike("post-1", liked));

    await waitFor(() => expect(fetchClient.post).toHaveBeenCalledWith(
      "/posts/post-1/like",
      { liked },
    ));
    await waitFor(() => {
      for (const key of [feedKey, ownerKey, viewerKey]) {
        expect(readPost(client, key)).toMatchObject({
          isLikedByMe: liked,
          likesCount,
        });
      }
    });
  });

  it("rolls back every touched cache when the API fails", async () => {
    vi.mocked(fetchClient.post).mockRejectedValue(new Error("failed"));
    const before = [feedKey, ownerKey, viewerKey].map((key) => readPost(client, key));
    const { result } = renderHook(() => useToggleLike(), { wrapper: wrapper(client) });

    act(() => result.current.toggleLike("post-1", true));

    await waitFor(() => expect(fetchClient.post).toHaveBeenCalled());
    await waitFor(() => {
      [feedKey, ownerKey, viewerKey].forEach((key, index) => {
        expect(readPost(client, key)).toEqual(before[index]);
      });
    });
  });

  it("uses the backend response rather than the optimistic count", async () => {
    vi.mocked(fetchClient.post).mockResolvedValue({ liked: true, likesCount: 9 });
    const { result } = renderHook(() => useToggleLike(), { wrapper: wrapper(client) });

    act(() => result.current.toggleLike("post-1", true));

    await waitFor(() => expect(readPost(client, feedKey)).toMatchObject({
      isLikedByMe: true,
      likesCount: 9,
    }));
  });
});
