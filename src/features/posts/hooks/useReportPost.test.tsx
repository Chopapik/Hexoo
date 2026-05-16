/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createAppError } from "@/lib/AppError";
import useReportPost from "./useReportPost";

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

vi.mock("@/i18n/errorCatalog", () => ({
  translateError: vi.fn((code: string) => `translated:${code}`),
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

describe("useReportPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts report to /posts/:id/report and calls success callback", async () => {
    vi.mocked(fetchClient.post).mockResolvedValue(undefined);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useReportPost(onSuccess), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        postId: "p1",
        reason: "spam",
        details: "ads",
      });
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());

    expect(fetchClient.post).toHaveBeenCalledWith("/posts/p1/report", {
      reason: "spam",
      details: "ads",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Zgłoszenie zostało wysłane do weryfikacji.",
    );
  });

  it("shows conflict toast when post was already reported", async () => {
    vi.mocked(fetchClient.post).mockRejectedValue(
      createAppError({
        code: "CONFLICT",
        message: "already reported",
      }),
    );

    const { result } = renderHook(() => useReportPost(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ postId: "p1", reason: "spam" });
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Już zgłosiłeś ten post."),
    );
  });

  it("shows translated error for other failures", async () => {
    vi.mocked(fetchClient.post).mockRejectedValue(
      createAppError({
        code: "INTERNAL_ERROR",
        message: "boom",
      }),
    );

    const { result } = renderHook(() => useReportPost(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ postId: "p1", reason: "hate" });
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("translated:INTERNAL_ERROR"),
    );
  });
});
