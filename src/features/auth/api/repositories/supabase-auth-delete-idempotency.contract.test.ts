import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteUser = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: {
    auth: { admin: { deleteUser } },
  },
}));

import { SupabaseAuthRepository } from "./implementations/supabaseAuthRepository";

describe("Batch 7 Supabase Auth deletion idempotency", () => {
  beforeEach(() => vi.clearAllMocks());

  it("treats an already-missing Auth identity as successful deletion", async () => {
    deleteUser.mockResolvedValue({
      error: { status: 404, message: "User not found" },
    });

    await expect(
      new SupabaseAuthRepository().deleteUser("already-deleted"),
    ).resolves.toBeUndefined();
  });

  it("keeps non-not-found Auth failures retryable", async () => {
    deleteUser.mockResolvedValue({
      error: { status: 503, message: "Auth unavailable" },
    });

    await expect(new SupabaseAuthRepository().deleteUser("user-1"))
      .rejects.toMatchObject({ code: "INTERNAL_ERROR" });
  });
});
