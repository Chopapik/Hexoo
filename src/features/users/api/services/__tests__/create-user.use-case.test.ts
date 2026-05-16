import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateUserUseCase } from "../use-cases/create-user.use-case";
import { createMockUserRepository } from "./helpers/user-test.helpers";
import { UserRole } from "../../../types/user.type";

describe("CreateUserUseCase", () => {
  let repository: ReturnType<typeof createMockUserRepository>;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    repository = createMockUserRepository();
    useCase = new CreateUserUseCase(repository);
  });

  it("creates user with mapped payload", async () => {
    await useCase.execute("uid-1", {
      name: "Alice",
      email: "alice@example.com",
      role: UserRole.User,
    });

    expect(repository.createUser).toHaveBeenCalledWith({
      uid: "uid-1",
      name: "Alice",
      email: "alice@example.com",
      role: UserRole.User,
    });
  });

  it("propagates repository errors", async () => {
    vi.mocked(repository.createUser).mockRejectedValue(new Error("db down"));

    await expect(
      useCase.execute("uid-1", {
        name: "Alice",
        email: "alice@example.com",
        role: UserRole.User,
      }),
    ).rejects.toThrow("db down");
  });
});
