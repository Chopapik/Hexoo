/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import useProfile from "./useProfile";
import type { UserProfileResponseDto } from "@/features/users/types/user.dto";

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

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when uid is empty", async () => {
    const { result } = renderHook(() => useProfile(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(fetchClient.get).not.toHaveBeenCalled();
    expect(result.current.userProfileData).toBeUndefined();
  });

  it("loads profile from /user/profile/:uid via fetch client", async () => {
    const profile: UserProfileResponseDto = {
      uid: "u1",
      name: "Ada",
      createdAt: new Date("2025-03-02"),
      lastOnline: new Date("2025-03-03"),
    };

    vi.mocked(fetchClient.get).mockResolvedValue({ user: profile });

    const { result } = renderHook(() => useProfile("u1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.userProfileData?.uid).toBe(profile.uid),
    );

    expect(fetchClient.get).toHaveBeenCalledWith("/user/profile/u1", {
      signal: expect.any(AbortSignal),
    });
    expect(result.current.userProfileData).toMatchObject({
      uid: profile.uid,
      name: profile.name,
    });
  });

  it("respects SSR initialData without invoking fetch initially", async () => {
    const initialUser: UserProfileResponseDto = {
      uid: "u2",
      name: "Alan",
      createdAt: new Date("2025-01-01"),
      lastOnline: new Date("2025-01-02"),
    };

    const { result } = renderHook(() => useProfile("u2", initialUser), {
      wrapper: createWrapper(),
    });

    expect(result.current.userProfileData).toMatchObject(initialUser);
    await waitFor(() => expect(fetchClient.get).not.toHaveBeenCalled());
    expect(result.current.isLoading).toBe(false);
  });
});
