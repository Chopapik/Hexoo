import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserByUidUseCase } from "../use-cases/get-user-by-uid.use-case";
import {
  createMockUser,
  createMockUserRepository,
} from "./helpers/user-test.helpers";

describe("GetUserByUidUseCase", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let useCase: GetUserByUidUseCase;

  beforeEach(() => {
    repository = createMockUserRepository();
    useCase = new GetUserByUidUseCase(repository);
  });

  it("returns user when found", async () => {
    const user = createMockUser({ uid: "found" });
    vi.mocked(repository.getUserByUid).mockResolvedValue(user);

    const result = await useCase.execute("found");

    expect(repository.getUserByUid).toHaveBeenCalledWith("found");
    expect(result).toBe(user);
  });

  it("returns null when user does not exist", async () => {
    vi.mocked(repository.getUserByUid).mockResolvedValue(null);

    expect(await useCase.execute("missing")).toBeNull();
  });

  it("propagates repository errors", async () => {
    vi.mocked(repository.getUserByUid).mockRejectedValue(new Error("timeout"));

    await expect(useCase.execute("u1")).rejects.toThrow("timeout");
  });
});
