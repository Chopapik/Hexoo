import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../user.service";
import { UserRole } from "../../../types/user.type";
import { createMockUser } from "./helpers/user-test.helpers";

function createMockUseCase<T extends object>() {
  return { execute: vi.fn() } as T & { execute: ReturnType<typeof vi.fn> };
}

describe("UserService", () => {
  const createUserUseCase = createMockUseCase();
  const getUserByUidUseCase = createMockUseCase();
  const getUserProfileUseCase = createMockUseCase();
  const touchLastOnlineUseCase = createMockUseCase();
  const getUsersByIdsUseCase = createMockUseCase();
  const unrestrictUserUseCase = createMockUseCase();
  const restrictUserUseCase = createMockUseCase();
  const restrictUserBySystemUseCase = createMockUseCase();

  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(
      createUserUseCase,
      getUserByUidUseCase,
      getUserProfileUseCase,
      touchLastOnlineUseCase,
      getUsersByIdsUseCase,
      unrestrictUserUseCase,
      restrictUserUseCase,
      restrictUserBySystemUseCase,
    );
  });

  it("delegates createUser and returns its result", async () => {
    const data = {
      name: "Alice",
      email: "a@b.com",
      role: UserRole.User,
    };
    createUserUseCase.execute.mockResolvedValue(undefined);

    await service.createUser("uid-1", data);

    expect(createUserUseCase.execute).toHaveBeenCalledWith("uid-1", data);
  });

  it("delegates getUserByUid and returns entity", async () => {
    const user = createMockUser({ uid: "u1" });
    getUserByUidUseCase.execute.mockResolvedValue(user);

    const result = await service.getUserByUid("u1");

    expect(getUserByUidUseCase.execute).toHaveBeenCalledWith("u1");
    expect(result).toBe(user);
  });

  it("delegates getUserProfile", async () => {
    const profile = { user: { uid: "u1", name: "Bob" } };
    getUserProfileUseCase.execute.mockResolvedValue(profile);

    const result = await service.getUserProfile("u1");

    expect(getUserProfileUseCase.execute).toHaveBeenCalledWith("u1");
    expect(result).toBe(profile);
  });

  it("delegates touchLastOnline with interval", async () => {
    await service.touchLastOnline("u1", 1000);

    expect(touchLastOnlineUseCase.execute).toHaveBeenCalledWith("u1", 1000);
  });

  it("delegates getUsersByIds", async () => {
    const map = { u1: { name: "A", avatarMeta: null } };
    getUsersByIdsUseCase.execute.mockResolvedValue(map);

    const result = await service.getUsersByIds(["a", "b"]);

    expect(getUsersByIdsUseCase.execute).toHaveBeenCalledWith(["a", "b"]);
    expect(result).toBe(map);
  });

  it("delegates unrestrictUser", async () => {
    await service.unrestrictUser("u1");

    expect(unrestrictUserUseCase.execute).toHaveBeenCalledWith("u1");
  });

  it("delegates restrictUser", async () => {
    const data = { uid: "u1", reason: "spam" };
    await service.restrictUser(data);

    expect(restrictUserUseCase.execute).toHaveBeenCalledWith(data);
  });

  it("delegates restrictUserBySystem", async () => {
    await service.restrictUserBySystem("u1", "AI flag");

    expect(restrictUserBySystemUseCase.execute).toHaveBeenCalledWith(
      "u1",
      "AI flag",
    );
  });
});
