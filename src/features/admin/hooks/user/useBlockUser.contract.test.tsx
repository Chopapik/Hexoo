/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import useBlockUser from "./useBlockUser";

vi.mock("@/lib/fetchClient", () => ({
  __esModule: true,
  default: {
    put: vi.fn(),
  },
}));

import fetchClient from "@/lib/fetchClient";

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  });

  return function Wrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    );
  };
}

describe("CLIENT-API-BLOCK-001 useBlockUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends target UID and explicit reason without trusted actor fields", async () => {
    vi.mocked(fetchClient.put).mockResolvedValue(undefined);
    const { result } = renderHook(() => useBlockUser(), { wrapper: wrapper() });

    act(() => {
      result.current.blockUser({
        uid: "target-user",
        reason: "spam lub naruszenie zasad",
      });
    });

    await waitFor(() => expect(fetchClient.put).toHaveBeenCalled());
    expect(fetchClient.put).toHaveBeenCalledWith("/admin/user/target-user/block", {
      reason: "spam lub naruszenie zasad",
    });
    expect(JSON.stringify(vi.mocked(fetchClient.put).mock.calls[0][1])).not.toMatch(
      /actor|bannedBy|role|uidToBlock/,
    );
  });

  it("propagates API errors", async () => {
    const error = new Error("api failed");
    vi.mocked(fetchClient.put).mockRejectedValue(error);
    const { result } = renderHook(() => useBlockUser(), { wrapper: wrapper() });

    act(() => {
      result.current.blockUser({
        uid: "target-user",
        reason: "spam lub naruszenie zasad",
      });
    });

    await waitFor(() => expect(result.current.error).toBe(error));
  });

  it("rejects blank reason before sending the request", async () => {
    const { result } = renderHook(() => useBlockUser(), { wrapper: wrapper() });

    act(() => {
      result.current.blockUser({
        uid: "target-user",
        reason: "   ",
      });
    });

    await waitFor(() =>
      expect(result.current.error).toMatchObject({
        code: "VALIDATION_ERROR",
      }),
    );
    expect(fetchClient.put).not.toHaveBeenCalled();
  });

  it("rejects missing reason before sending the request", async () => {
    const { result } = renderHook(() => useBlockUser(), { wrapper: wrapper() });

    act(() => {
      result.current.blockUser({
        uid: "target-user",
      } as Parameters<typeof result.current.blockUser>[0]);
    });

    await waitFor(() =>
      expect(result.current.error).toMatchObject({
        code: "VALIDATION_ERROR",
      }),
    );
    expect(fetchClient.put).not.toHaveBeenCalled();
  });
});
