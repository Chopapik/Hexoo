import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUsersByIdsUseCase } from "../use-cases/get-users-by-ids.use-case";
import {
  createMockUserRepository,
  expectAppError,
} from "./helpers/user-test.helpers";

describe("GetUsersByIdsUseCase", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let useCase: GetUsersByIdsUseCase;

  beforeEach(() => {
    repository = createMockUserRepository();
    useCase = new GetUsersByIdsUseCase(repository);
  });

  it("returns empty object for empty uids", async () => {
    expect(await useCase.execute([])).toEqual({});
    expect(repository.getUsersByIds).not.toHaveBeenCalled();
  });

  it("returns empty object when uids is nullish", async () => {
    expect(await useCase.execute(null as unknown as string[])).toEqual({});
    expect(repository.getUsersByIds).not.toHaveBeenCalled();
  });

  it("returns users map from repository", async () => {
    const map = {
      u1: { name: "Alice", avatarMeta: null },
      u2: { name: "Bob" },
    };
    vi.mocked(repository.getUsersByIds).mockResolvedValue(map);

    const result = await useCase.execute(["u1", "u2"]);

    expect(result).toEqual(map);
    expect(repository.getUsersByIds).toHaveBeenCalledWith(["u1", "u2"]);
  });

  it("passes duplicate ids through unchanged because dedupe is repository-owned", async () => {
    const map = {
      u1: { name: "Alice", avatarMeta: null },
    };
    vi.mocked(repository.getUsersByIds).mockResolvedValue(map);

    const result = await useCase.execute(["u1", "u1", "u2"]);

    expect(result).toBe(map);
    expect(repository.getUsersByIds).toHaveBeenCalledWith(["u1", "u1", "u2"]);
  });

  it("throws DB_ERROR when repository fails", async () => {
    vi.mocked(repository.getUsersByIds).mockRejectedValue(
      new Error("connection lost"),
    );

    await expectAppError(() => useCase.execute(["u1"]), "DB_ERROR");
  });
});
