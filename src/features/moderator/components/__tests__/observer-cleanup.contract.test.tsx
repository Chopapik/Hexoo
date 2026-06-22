/** @vitest-environment jsdom */
import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ModeratorDashboard from "../ModeratorDashboard";

const observe = vi.fn();
const unobserve = vi.fn();
const disconnect = vi.fn();

vi.mock("../../hooks/useModeratorDashboard", () => ({
  useModeratorDashboard: () => ({
    data: { pages: [[]] },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    isFetching: false,
    fetchNextPage: vi.fn(),
    hasNextPage: true,
    isFetchingNextPage: false,
    performPostAction: vi.fn(),
    performCommentAction: vi.fn(),
    isActionPending: false,
  }),
}));

vi.mock("@/i18n/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/features/shared/components/ui/Button", () => ({
  default: () => <button type="button">button</button>,
}));

vi.mock("@/features/shared/components/ui/SelectionTabButton", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("@/features/shared/components/ui/AppLoader", () => ({
  AppLoader: () => <span>loading</span>,
}));

vi.mock("../ModerationQueueItem", () => ({ default: () => null }));
vi.mock("../ModerationCommentQueueItem", () => ({ default: () => null }));

describe("CLIENT-ASYNC-STALE-001 ModeratorDashboard observer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    class IntersectionObserverMock {
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    }
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  it("unobserves the exact captured node and disconnects on cleanup", () => {
    const { unmount } = render(<ModeratorDashboard />);
    expect(observe).toHaveBeenCalledTimes(1);
    const observedNode = observe.mock.calls[0][0];

    unmount();

    expect(unobserve).toHaveBeenCalledWith(observedNode);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
