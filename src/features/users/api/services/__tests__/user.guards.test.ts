import { describe, it, expect } from "vitest";
import { ensureModeratorOrAdmin, assertUid } from "../user.guards";
import {
  createMockSession,
  expectAppError,
} from "./helpers/user-test.helpers";
import { UserRole } from "../../../types/user.type";

describe("user.guards", () => {
  describe("ensureModeratorOrAdmin", () => {
    it("returns session for moderator", () => {
      const session = createMockSession(UserRole.Moderator);
      expect(ensureModeratorOrAdmin(session)).toBe(session);
    });

    it("returns session for admin", () => {
      const session = createMockSession(UserRole.Admin);
      expect(ensureModeratorOrAdmin(session)).toBe(session);
    });

    it("throws AUTH_REQUIRED when session is null", async () => {
      await expectAppError(
        async () => ensureModeratorOrAdmin(null),
        "AUTH_REQUIRED",
      );
    });

    it("throws FORBIDDEN for regular user", async () => {
      await expectAppError(
        async () => ensureModeratorOrAdmin(createMockSession(UserRole.User)),
        "FORBIDDEN",
      );
    });
  });

  describe("assertUid", () => {
    it("does not throw for non-empty uid", () => {
      expect(() => assertUid("user-1", "TestContext")).not.toThrow();
    });

    it("throws INVALID_INPUT for empty uid", async () => {
      await expectAppError(
        async () => assertUid("", "TestContext"),
        "INVALID_INPUT",
      );
    });
  });
});
