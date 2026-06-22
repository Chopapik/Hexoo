import { describe, it, expect } from "vitest";
import {
  requireSession,
  assertPostId,
  assertPostExists,
  assertPostAuthor,
} from "../post.guards";
import {
  createMockSession,
  createMockPost,
  expectAppError,
} from "./helpers/post-test.helpers";

describe("post.guards", () => {
  describe("requireSession", () => {
    it("returns session when session is present", () => {
      const session = createMockSession();
      expect(requireSession(session)).toBe(session);
    });

    it("throws AUTH_REQUIRED when session is null", async () => {
      await expectAppError(async () => requireSession(null), "AUTH_REQUIRED");
    });
  });

  describe("assertPostId", () => {
    it("does not throw for a valid non-empty id", () => {
      expect(() => assertPostId("post-1", "TestCtx")).not.toThrow();
    });

    it("throws INVALID_INPUT for empty string", async () => {
      await expectAppError(
        async () => assertPostId("", "TestCtx"),
        "INVALID_INPUT",
      );
    });

    it("throws INVALID_INPUT for whitespace-only id", async () => {
      await expectAppError(
        async () => assertPostId("   ", "TestCtx"),
        "INVALID_INPUT",
      );
    });
  });

  describe("assertPostExists", () => {
    it("does not throw when post entity is present", () => {
      expect(() => assertPostExists(createMockPost())).not.toThrow();
    });

    it("throws NOT_FOUND when post is null", async () => {
      await expectAppError(async () => assertPostExists(null), "NOT_FOUND");
    });
  });

  describe("assertPostAuthor", () => {
    it("does not throw when userId matches post.userId", () => {
      const post = createMockPost({ userId: "user-1" });
      expect(() => assertPostAuthor(post, "user-1")).not.toThrow();
    });

    it("throws FORBIDDEN when userId does not match", async () => {
      const post = createMockPost({ userId: "user-1" });
      await expectAppError(
        async () => assertPostAuthor(post, "user-2"),
        "FORBIDDEN",
      );
    });
  });
});
