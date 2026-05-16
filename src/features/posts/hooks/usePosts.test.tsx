/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PublicPostResponseDto } from "@/features/posts/types/post.dto";
import usePosts from "./usePosts";

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

import fetchClient from "@/lib/fetchClient";

function createWrapper(config?: Pick<QueryClientConfig, "defaultOptions">) {
  const client = new QueryClient({
    ...config,
    defaultOptions: {
      ...config?.defaultOptions,
      queries: {
        retry: false,
        ...(config?.defaultOptions?.queries ?? {}),
      },
    },
  });

  return function Wrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
    );
  };
}

describe("usePosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads first page with limit and derives next cursor from last id", async () => {
    const posts = [
      { id: "p1" },
      { id: "p2" },
    ] as unknown as PublicPostResponseDto[];

    vi.mocked(fetchClient.get).mockResolvedValue(posts);

    const { result } = renderHook(() => usePosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data?.pages[0]).toEqual(posts));

    const firstCallUrl = vi.mocked(fetchClient.get).mock.calls[0][0] as string;
    expect(firstCallUrl).toContain("/posts?");
    expect(firstCallUrl).toContain("limit=20");

    expect(result.current.data?.pages[0]?.length).toBe(2);
    expect(await result.current.fetchNextPage()).toBeTruthy();

    await waitFor(() =>
      expect(vi.mocked(fetchClient.get).mock.calls.length).toBeGreaterThan(1),
    );

    const secondUrl = vi.mocked(fetchClient.get).mock.calls[1][0] as string;
    expect(secondUrl).toContain("startAfter=p2");
  });

  it("does not request next page when last page is empty", async () => {
    vi.mocked(fetchClient.get).mockResolvedValue([]);

    const { result } = renderHook(() => usePosts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data?.pages[0]).toEqual([]));
    expect(result.current.hasNextPage).toBe(false);
  });
});
