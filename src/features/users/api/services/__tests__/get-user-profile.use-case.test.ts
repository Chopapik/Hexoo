import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserProfileUseCase } from "../use-cases/get-user-profile.use-case";
import { UserProfileMapper } from "../user.profile.mapper";
import {
  createMockUser,
  createMockUserRepository,
} from "./helpers/user-test.helpers";

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(() => undefined),
}));

describe("GetUserProfileUseCase", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let useCase: GetUserProfileUseCase;

  beforeEach(() => {
    repository = createMockUserRepository();
    useCase = new GetUserProfileUseCase(repository, new UserProfileMapper());
  });

  it("returns null for empty uid", async () => {
    expect(await useCase.execute("")).toBeNull();
    expect(repository.getUserByUid).not.toHaveBeenCalled();
  });

  it("returns null for whitespace-only uid", async () => {
    expect(await useCase.execute("   ")).toBeNull();
    expect(repository.getUserByUid).not.toHaveBeenCalled();
  });

  it("returns null when user not found", async () => {
    vi.mocked(repository.getUserByUid).mockResolvedValue(null);

    expect(await useCase.execute("  unknown  ")).toBeNull();
    expect(repository.getUserByUid).toHaveBeenCalledWith("unknown");
  });

  it("returns mapped profile when user exists", async () => {
    const user = createMockUser({ uid: "u1", name: "Bob" });
    vi.mocked(repository.getUserByUid).mockResolvedValue(user);

    const result = await useCase.execute("  u1  ");

    expect(repository.getUserByUid).toHaveBeenCalledWith("u1");
    expect(result).toEqual({
      user: {
        uid: "u1",
        name: "Bob",
        avatarUrl: undefined,
        lastOnline: user.lastOnline,
        createdAt: user.createdAt,
      },
    });
  });
});
