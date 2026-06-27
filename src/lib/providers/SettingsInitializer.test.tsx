/** @vitest-environment jsdom */
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const storeMocks = vi.hoisted(() => ({
  initializeSettings: vi.fn(),
  initializeDitheringSettings: vi.fn(),
}));

vi.mock("@/lib/store/store", () => ({
  useAppStore: {
    getState: () => ({
      initializeSettings: storeMocks.initializeSettings,
      initializeDitheringSettings: storeMocks.initializeDitheringSettings,
    }),
  },
}));

import SettingsInitializer from "./SettingsInitializer";

describe("SettingsInitializer", () => {
  it("initializes settings once per client runtime", async () => {
    const firstRender = render(<SettingsInitializer />);

    await waitFor(() => {
      expect(storeMocks.initializeSettings).toHaveBeenCalledTimes(1);
      expect(storeMocks.initializeDitheringSettings).toHaveBeenCalledTimes(1);
    });

    firstRender.unmount();
    render(<SettingsInitializer />);

    expect(storeMocks.initializeSettings).toHaveBeenCalledTimes(1);
    expect(storeMocks.initializeDitheringSettings).toHaveBeenCalledTimes(1);
  });
});
