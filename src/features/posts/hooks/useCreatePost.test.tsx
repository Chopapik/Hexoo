/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import useCreatePost from "./useCreatePost";
import type { CreatePostResponseDto } from "@/features/posts/types/post.dto";

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

vi.mock("@/lib/store/store", () => ({
  useAppStore: vi.fn((selector: (state: { settings: { showNSFWPosts: boolean } }) => unknown) =>
    selector({ settings: { showNSFWPosts: true } }),
  ),
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

describe("useCreatePost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts to /posts and invalidates posts query on success", async () => {
    const response: CreatePostResponseDto = {
      postId: "p1",
      isPending: false,
      isNSFW: false,
    };
    vi.mocked(fetchClient.post).mockResolvedValue(response);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreatePost(onSuccess), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.createPost({ text: "Hello", youtubeUrl: "" });
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(response));

    expect(fetchClient.post).toHaveBeenCalledWith("/posts", {
      text: "Hello",
      youtubeUrl: "",
    });
    expect(toast.success).toHaveBeenCalledWith("Post dodany!");
    expect(onSuccess).toHaveBeenCalledWith(response);
  });

  it("shows moderation toast when post is pending", async () => {
    vi.mocked(fetchClient.post).mockResolvedValue({
      postId: "p1",
      isPending: true,
      isNSFW: false,
    });

    const { result } = renderHook(() => useCreatePost(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.createPost({ text: "Hello", youtubeUrl: "" });
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Post dodany i czeka na weryfikację moderacji.",
        expect.objectContaining({ duration: 7000 }),
      ),
    );
  });

  it("calls error callback on failure", async () => {
    const error = new Error("network");
    vi.mocked(fetchClient.post).mockRejectedValue(error);

    const onError = vi.fn();
    const { result } = renderHook(() => useCreatePost(undefined, onError), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.createPost({ text: "Hello", youtubeUrl: "" });
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
  });
});
