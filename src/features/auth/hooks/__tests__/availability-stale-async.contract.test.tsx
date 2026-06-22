/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCheckUsername } from "../useCheckUsername";

vi.mock("@/lib/fetchClient", () => ({
  default: { post: vi.fn() },
}));

import fetchClient from "@/lib/fetchClient";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("CLIENT-ASYNC-STALE-001 username availability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("ignores a superseded response even when transport abort is ignored", async () => {
    const oldRequest = deferred<{ available: boolean }>();
    const newRequest = deferred<{ available: boolean }>();
    vi.mocked(fetchClient.post)
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);

    const { result, rerender } = renderHook(
      ({ username }) => useCheckUsername(username),
      { initialProps: { username: "old-name" } },
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    rerender({ username: "new-name" });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    await act(async () => {
      newRequest.resolve({ available: true });
      await Promise.resolve();
    });
    expect(result.current.isAvailable).toBe(true);

    await act(async () => {
      oldRequest.resolve({ available: false });
      await Promise.resolve();
    });
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("aborts the in-flight request on unmount", async () => {
    const request = deferred<{ available: boolean }>();
    vi.mocked(fetchClient.post).mockReturnValue(request.promise);
    const { unmount } = renderHook(() => useCheckUsername("alice"));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    const options = vi.mocked(fetchClient.post).mock.calls[0][2];
    expect(options?.signal?.aborted).toBe(false);
    unmount();
    expect(options?.signal?.aborted).toBe(true);
  });
});
