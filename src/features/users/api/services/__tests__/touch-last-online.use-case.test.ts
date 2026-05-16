import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TouchLastOnlineUseCase } from "../use-cases/touch-last-online.use-case";
import {
  createMockUser,
  createMockUserRepository,
} from "./helpers/user-test.helpers";

describe("TouchLastOnlineUseCase", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let useCase: TouchLastOnlineUseCase;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:00:00Z"));
    repository = createMockUserRepository();
    useCase = new TouchLastOnlineUseCase(repository);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing when uid is empty", async () => {
    await useCase.execute("");

    expect(repository.getUserByUid).not.toHaveBeenCalled();
  });

  it("does nothing when user does not exist", async () => {
    vi.mocked(repository.getUserByUid).mockResolvedValue(null);

    await useCase.execute("ghost");

    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("skips update when last online is within min interval", async () => {
    vi.mocked(repository.getUserByUid).mockResolvedValue(
      createMockUser({
        lastOnline: new Date("2024-06-01T11:56:00Z"),
      }),
    );

    await useCase.execute("user-1", 5 * 60 * 1000);

    expect(repository.updateUser).not.toHaveBeenCalled();
  });

  it("updates lastOnline when interval has passed", async () => {
    vi.mocked(repository.getUserByUid).mockResolvedValue(
      createMockUser({
        lastOnline: new Date("2024-06-01T10:00:00Z"),
      }),
    );

    await useCase.execute("user-1", 5 * 60 * 1000);

    expect(repository.updateUser).toHaveBeenCalledWith("user-1", {
      lastOnline: new Date("2024-06-01T12:00:00Z"),
    });
  });

  it("updates when minIntervalMs is 0", async () => {
    vi.mocked(repository.getUserByUid).mockResolvedValue(
      createMockUser({
        lastOnline: new Date("2024-06-01T11:59:00Z"),
      }),
    );

    await useCase.execute("user-1", 0);

    expect(repository.updateUser).toHaveBeenCalled();
  });
});
