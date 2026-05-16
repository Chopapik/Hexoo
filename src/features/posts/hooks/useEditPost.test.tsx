/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import useEditPost from "./useEditPost";
import type { PublicPostResponseDto } from "@/features/posts/types/post.dto";

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

describe("useEditPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("puts to /posts/:id and invalidates posts on success", async () => {
    const updated = { id: "p1", text: "Updated" } as PublicPostResponseDto;
    vi.mocked(fetchClient.put).mockResolvedValue(updated);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useEditPost("p1", onSuccess), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.editPost({ text: "Updated" });
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    expect(fetchClient.put).toHaveBeenCalledWith("/posts/p1", { text: "Updated" });
    expect(toast.success).toHaveBeenCalledWith("Post został zaktualizowany!");
  });

  it("calls error callback on failure", async () => {
    const error = new Error("forbidden");
    vi.mocked(fetchClient.put).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useEditPost("p1", undefined, onError), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.editPost({ text: "Updated" });
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
