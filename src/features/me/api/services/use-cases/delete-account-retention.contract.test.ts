import { describe, expect, it, vi } from "vitest";
import { UserRole } from "@/features/users/types/user.type";

vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(async () => undefined),
}));

import { DeleteAccountUseCase } from "./delete-account.use-case";

describe("ACCOUNT-DELETE-RETENTION-001", () => {
  it("delegates self deletion only to the tombstone/recovery coordinator", async () => {
    const processor = {
      execute: vi.fn(async () => ({ state: "completed" as const })),
    };
    const useCase = new DeleteAccountUseCase(
      {
        uid: "user-1",
        email: "private@example.test",
        name: "Private Name",
        role: UserRole.User,
      },
      processor as never,
    );

    await expect(useCase.execute()).resolves.toEqual({ state: "completed" });
    expect(processor.execute).toHaveBeenCalledWith("user-1");
  });
});
