import { beforeEach, describe, expect, it, vi } from "vitest";

const dependencies = vi.hoisted(() => ({
  enforceStrictModeration: vi.fn(async () => undefined),
}));
vi.mock("@/features/activity/api/services", () => ({ logActivity: vi.fn() }));
vi.mock("@/features/images/api/image.service", () => ({
  prepareImage: vi.fn(),
  uploadPreparedImage: vi.fn(),
  deleteImage: vi.fn(),
}));
vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: vi.fn(() => "https://example.test/new.webp"),
}));
vi.mock("@/features/auth/api/utils/checkUsernameUnique", () => ({
  isUsernameTaken: vi.fn(async () => false),
}));
vi.mock("@/features/moderation/utils/assessSafety", () => ({
  enforceStrictModeration: dependencies.enforceStrictModeration,
}));

import { UpdateProfileUseCase } from "./update-profile.use-case";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import { UserRole } from "@/features/users/types/user.type";

const oldImage = {
  storageBucket: "bucket",
  storageLocation: "avatars",
  fileName: "old.webp",
  downloadToken: "old-token",
  contentType: "image/webp",
  sizeBytes: 10,
};
const newImage = {
  ...oldImage,
  fileName: "new.webp",
  downloadToken: "new-token",
  publicUrl: "https://example.test/new.webp",
};
const session = {
  uid: "user-1",
  email: "user@example.test",
  name: "User",
  role: UserRole.User,
};

function setup() {
  const userRepository = {
    getUserByUid: vi.fn().mockResolvedValue({ avatarMeta: oldImage }),
    updateUser: vi.fn().mockResolvedValue(undefined),
  } as unknown as UserRepository;
  const authRepository = {
    updateUser: vi.fn().mockResolvedValue(undefined),
  } as unknown as AuthRepository;
  const prepared = {
    file: new File([new Uint8Array([1])], "avatar.png", { type: "image/png" }),
    inputBuffer: Buffer.from([1]),
    metadata: { width: 1, height: 1, pages: 1 },
  };
  const images = {
    prepare: vi.fn(async () => prepared),
    upload: vi.fn(async () => newImage),
    delete: vi.fn(async () => undefined),
  };
  return { userRepository, authRepository, images, prepared };
}

describe("profile avatar storage contracts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("validates resource limits before moderation and upload", async () => {
    const { userRepository, authRepository, images } = setup();
    images.prepare.mockRejectedValueOnce({ code: "VALIDATION_ERROR" });
    const useCase = new UpdateProfileUseCase(
      session,
      userRepository,
      authRepository,
      images,
    );
    await expect(
      useCase.execute({
        avatarFile: new File([new Uint8Array([1])], "avatar.png", {
          type: "image/png",
        }),
      }),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    expect(dependencies.enforceStrictModeration).not.toHaveBeenCalled();
    expect(images.upload).not.toHaveBeenCalled();
  });

  it("rolls back the new avatar and preserves the old one when DB update fails", async () => {
    const { userRepository, authRepository, images } = setup();
    vi.mocked(userRepository.updateUser).mockRejectedValue(new Error("db failed"));
    const useCase = new UpdateProfileUseCase(
      session,
      userRepository,
      authRepository,
      images,
    );
    await expect(
      useCase.execute({
        avatarFile: new File([new Uint8Array([1])], "avatar.png", {
          type: "image/png",
        }),
      }),
    ).rejects.toThrow("db failed");
    expect(images.delete).toHaveBeenCalledTimes(1);
    expect(images.delete).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "new.webp" }),
    );
    expect(images.delete).not.toHaveBeenCalledWith(oldImage);
  });

  it("rolls back the new avatar when the accompanying Auth update fails", async () => {
    const { userRepository, authRepository, images } = setup();
    vi.mocked(authRepository.updateUser).mockRejectedValue(
      new Error("auth failed"),
    );
    const useCase = new UpdateProfileUseCase(
      session,
      userRepository,
      authRepository,
      images,
    );
    await expect(
      useCase.execute({
        name: "UpdatedUser",
        avatarFile: new File([new Uint8Array([1])], "avatar.png", {
          type: "image/png",
        }),
      }),
    ).rejects.toThrow("auth failed");
    expect(userRepository.updateUser).not.toHaveBeenCalled();
    expect(images.delete).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: "new.webp" }),
    );
    expect(images.delete).not.toHaveBeenCalledWith(oldImage);
  });

  it("deletes the old avatar only after DB update commits", async () => {
    const { userRepository, authRepository, images } = setup();
    await new UpdateProfileUseCase(
      session,
      userRepository,
      authRepository,
      images,
    ).execute({
      avatarFile: new File([new Uint8Array([1])], "avatar.png", {
        type: "image/png",
      }),
    });
    expect(images.delete).toHaveBeenCalledWith(oldImage);
    expect(vi.mocked(userRepository.updateUser).mock.invocationCallOrder[0]).toBeLessThan(
      images.delete.mock.invocationCallOrder[0],
    );
  });
});
