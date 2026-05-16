/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useActiveUsers } from "./useActiveUsers";

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
      queries: { retry: false, ...(config?.defaultOptions?.queries ?? {}) },
    },
  });

  return function Wrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
    );
  };
}

describe("useActiveUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { label: "empty", uids: [] as string[] },
    { label: "single", uids: ["only-one"] },
  ])("does not call API when uid list length is ≤1 (%s)", async ({ uids }) => {
    const { result } = renderHook(() => useActiveUsers(uids), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(fetchClient.post).not.toHaveBeenCalled());
    await waitFor(() => expect(result.current.isFetching).toBe(false));
  });

  it("posts uids sorted by dependency key ordering", async () => {
    vi.mocked(fetchClient.post).mockResolvedValue({
      users: [
        { uid: "b", name: "Berta" },
        { uid: "a", name: "Anna", avatarUrl: "https://x" },
      ],
    });

    const { result } = renderHook(() => useActiveUsers(["a", "b"]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.data).toHaveLength(2));

    expect(fetchClient.post).toHaveBeenCalledWith(
      "/users/by-ids",
      { uids: ["a", "b"] },
      { signal: expect.any(AbortSignal) },
    );

    expect(result.current.data?.[1]).toMatchObject({
      uid: "a",
      name: "Anna",
      avatarUrl: "https://x",
    });
  });
});
