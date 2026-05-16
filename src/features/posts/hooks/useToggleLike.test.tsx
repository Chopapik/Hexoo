/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  InfiniteData,
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PublicPostResponseDto } from "@/features/posts/types/post.dto";
import { useToggleLike } from "./useToggleLike";

vi.mock("@/lib/fetchClient", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import fetchClient from "@/lib/fetchClient";
import toast from "react-hot-toast";

function createWrapper(
  client: QueryClient,
  config?: Pick<QueryClientConfig, "defaultOptions">,
) {
  const queryClient = client;
  queryClient.setDefaultOptions({
    ...config?.defaultOptions,
    mutations: { retry: false, ...(config?.defaultOptions?.mutations ?? {}) },
  });

  return function Wrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    );
  };
}

function seedPostsCache(client: QueryClient, posts: PublicPostResponseDto[]) {
  client.setQueryData<InfiniteData<PublicPostResponseDto[]>>(["posts"], {
    pages: [posts],
    pageParams: [undefined],
  });
}

describe("useToggleLike", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  it("optimistically toggles like in posts cache", async () => {
    vi.mocked(fetchClient.post).mockResolvedValue(undefined);

    const post = {
      id: "p1",
      likesCount: 3,
      isLikedByMe: false,
    } as PublicPostResponseDto;

    seedPostsCache(queryClient, [post]);

    const { result } = renderHook(() => useToggleLike(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.toggleLike("p1");
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<
        InfiniteData<PublicPostResponseDto[]>
      >(["posts"]);
      expect(cached?.pages[0][0]).toMatchObject({
        id: "p1",
        isLikedByMe: true,
        likesCount: 4,
      });
    });

    await waitFor(() =>
      expect(fetchClient.post).toHaveBeenCalledWith("/posts/p1/like"),
    );
  });

  it("rolls back cache and shows toast on error", async () => {
    vi.mocked(fetchClient.post).mockRejectedValue(new Error("like failed"));

    const post = {
      id: "p1",
      likesCount: 5,
      isLikedByMe: true,
    } as PublicPostResponseDto;

    seedPostsCache(queryClient, [post]);

    const { result } = renderHook(() => useToggleLike(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.toggleLike("p1");
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Nie udało się polubić posta"),
    );

    const cached = queryClient.getQueryData<InfiniteData<PublicPostResponseDto[]>>(
      ["posts"],
    );
    expect(cached?.pages[0][0]).toMatchObject({
      id: "p1",
      isLikedByMe: true,
      likesCount: 5,
    });
  });
});
