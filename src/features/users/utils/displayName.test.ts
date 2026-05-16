import { describe, it, expect } from "vitest";
import { normalizeDisplayName } from "./displayName";

describe("normalizeDisplayName", () => {
  it("trims whitespace and lowercases ascii", () => {
    expect(normalizeDisplayName("  Ada Lovelace ")).toBe("ada lovelace");
  });

  it("returns empty string for whitespace-only values", () => {
    expect(normalizeDisplayName("   \t  ")).toBe("");
  });
});
