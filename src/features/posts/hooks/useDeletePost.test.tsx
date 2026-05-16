/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import useDeletePost from "./useDeletePost";

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

function createWrapper(config?: Pick<QueryClientConfig, "defaultOptions">) {
  const client = new QueryClient({
    ...config,
    defaultOptions: {
      ...config?.defaultOptions,
      mutations: { retry: false, ...(config?.defaultOptions?.mutations ?? {}) },
    },
  });

  return function Wrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{props.children}</QueryClientProvider>
    );
  };
}

describe("useDeletePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes /posts/:id and invalidates posts on success", async () => {
    vi.mocked(fetchClient.delete).mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useDeletePost("p1", onSuccess), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.deletePost();
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    expect(fetchClient.delete).toHaveBeenCalledWith("/posts/p1");
    expect(toast.success).toHaveBeenCalledWith("Post został usunięty.");
  });

  it("shows error toast and calls error callback on failure", async () => {
    const error = new Error("failed");
    vi.mocked(fetchClient.delete).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useDeletePost("p1", undefined, onError), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.deletePost();
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));

    expect(toast.error).toHaveBeenCalledWith("Nie udało się usunąć posta.");
  });
});
