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
  let profileMapper: UserProfileMapper;
  let useCase: GetUserProfileUseCase;

  beforeEach(() => {
    repository = createMockUserRepository();
    profileMapper = new UserProfileMapper();
    useCase = new GetUserProfileUseCase(repository, profileMapper);
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

  it("returns null when user is deleted", async () => {
    vi.mocked(repository.getUserByUid).mockResolvedValue(
      createMockUser({
        uid: "deleted-user",
        deletedAt: new Date("2024-02-01T00:00:00Z"),
      }),
    );

    expect(await useCase.execute("deleted-user")).toBeNull();
  });

  it("does not map deleted users into public profile responses", async () => {
    const mapperSpy = vi.spyOn(profileMapper, "toProfileResponse");
    vi.mocked(repository.getUserByUid).mockResolvedValue(
      createMockUser({
        uid: "deleted-user",
        deletedAt: new Date("2024-02-01T00:00:00Z"),
      }),
    );

    expect(await useCase.execute("deleted-user")).toBeNull();
    expect(mapperSpy).not.toHaveBeenCalled();
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

  it("propagates repository errors", async () => {
    vi.mocked(repository.getUserByUid).mockRejectedValue(new Error("db down"));

    await expect(useCase.execute("u1")).rejects.toThrow("db down");
  });
});
