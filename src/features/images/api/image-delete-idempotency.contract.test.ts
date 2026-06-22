import { beforeEach, describe, expect, it, vi } from "vitest";

const remove = vi.hoisted(() => vi.fn());
const from = vi.hoisted(() => vi.fn(() => ({ remove })));

vi.mock("@/lib/supabaseServer", () => ({
  supabaseAdmin: { storage: { from } },
}));

import { SupabaseImageStorageRepository } from "./image.supabase.repository";

describe("Batch 7 avatar deletion idempotency", () => {
  beforeEach(() => vi.clearAllMocks());

  it("treats an already-missing avatar object as successful cleanup", async () => {
    remove.mockResolvedValue({
      error: { status: 404, message: "Object not found" },
    });

    await expect(
      new SupabaseImageStorageRepository().deleteObject(
        "media",
        "avatars/missing.webp",
      ),
    ).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledWith(["avatars/missing.webp"]);
  });

  it("keeps other storage failures retryable", async () => {
    remove.mockResolvedValue({
      error: { status: 503, message: "Storage unavailable" },
    });

    await expect(
      new SupabaseImageStorageRepository().deleteObject(
        "media",
        "avatars/user.webp",
      ),
    ).rejects.toMatchObject({ status: 503 });
  });
});
