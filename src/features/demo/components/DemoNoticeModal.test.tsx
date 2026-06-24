/** @vitest-environment jsdom */
import type { HTMLAttributes, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

import DemoNoticeModal from "./DemoNoticeModal";

describe("DemoNoticeModal", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render outside demo mode", () => {
    render(<DemoNoticeModal isDemo={false} />);

    expect(screen.queryByText("Demo")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders in demo mode until dismissed", async () => {
    render(<DemoNoticeModal isDemo />);

    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(await screen.findByRole("dialog")).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(screen.getByText("Public demo version")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "I understand" }));

    expect(window.localStorage.getItem("hexoo-demo-notice-seen")).toBe("true");
  });

  it("does not reopen the dialog when it was seen in this browser", () => {
    window.localStorage.setItem("hexoo-demo-notice-seen", "true");

    render(<DemoNoticeModal isDemo />);

    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
