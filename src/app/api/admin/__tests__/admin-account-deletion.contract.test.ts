import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { UserRole } from "@/features/users/types/user.type";
import { createAppError } from "@/lib/AppError";

vi.mock("@/features/auth/api/utils/session-user.service", () => ({
  getAdminFromSession: vi.fn(),
}));
vi.mock("@/features/auth/api/utils/session.cookies", () => ({
  clearAllAuthCookies: vi.fn(async () => undefined),
}));
vi.mock("@/features/admin/api/services", () => ({
  adminDeleteUser: vi.fn(),
}));
vi.mock("@/features/auth/api/repositories", () => ({
  authRepository: {
    deleteUser: vi.fn(async () => undefined),
    updateUser: vi.fn(async () => undefined),
  },
}));
vi.mock("@/features/users/api/repositories", () => ({
  userRepository: {
    deleteUser: vi.fn(async () => undefined),
    getAllUsers: vi.fn(async () => []),
    updateUser: vi.fn(async () => undefined),
  },
}));
vi.mock("@/features/activity/api/services", () => ({
  logActivity: vi.fn(async () => undefined),
}));

import { DELETE } from "../user/[uid]/route";
import { adminDeleteUser } from "@/features/admin/api/services";
import { getAdminFromSession } from "@/features/auth/api/utils/session-user.service";
import { clearAllAuthCookies } from "@/features/auth/api/utils/session.cookies";
import { userRepository } from "@/features/users/api/repositories";
import { authRepository } from "@/features/auth/api/repositories";
import { AdminService } from "@/features/admin/api/services/admin.service";
import { ProcessAccountDeletionUseCase } from "@/features/me/api/services/use-cases/process-account-deletion.use-case";
import type {
  AccountDeletionJob,
  AccountDeletionRepository,
} from "@/features/me/api/repositories";

const adminSession = {
  uid: "admin-1",
  email: "admin@example.test",
  name: "Admin",
  role: UserRole.Admin,
};

describe("admin Batch 7 account deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminFromSession).mockResolvedValue(adminSession);
  });

  it("maps durable recovery pending to 202 without clearing the actor session", async () => {
    vi.mocked(adminDeleteUser).mockResolvedValue({ state: "recovery_pending" });

    const response = await DELETE(
      new NextRequest("http://localhost/api/admin/user/user-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ uid: "user-1" }) },
    );

    expect(response.status).toBe(202);
    expect(clearAllAuthCookies).not.toHaveBeenCalled();
  });

  it("clears cookies only when the admin deletes self successfully", async () => {
    vi.mocked(adminDeleteUser).mockResolvedValue({ state: "completed" });

    const response = await DELETE(
      new NextRequest("http://localhost/api/admin/user/admin-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ uid: "admin-1" }) },
    );

    expect(response.status).toBe(200);
    expect(clearAllAuthCookies).toHaveBeenCalledOnce();
  });

  it("preserves cookies when self deletion is rejected", async () => {
    vi.mocked(adminDeleteUser).mockRejectedValue(
      createAppError({ code: "FORBIDDEN", message: "last active admin" }),
    );

    const response = await DELETE(
      new NextRequest("http://localhost/api/admin/user/admin-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ uid: "admin-1" }) },
    );

    expect(response.status).toBe(403);
    expect(clearAllAuthCookies).not.toHaveBeenCalled();
  });

  it("uses the shared tombstone coordinator instead of legacy hard deletes", async () => {
    vi.mocked(userRepository.getAllUsers).mockResolvedValue([
      {
        ...adminSession,
        uid: "user-1",
        role: UserRole.User,
        hasUsername: true,
        createdAt: new Date(),
        lastOnline: new Date(),
      },
    ]);
    const retainedPost = {
      id: "post-1",
      imageMeta: { storageLocation: "posts", fileName: "post.webp" },
    };
    const retainedComment = {
      id: "comment-1",
      imageMeta: { storageLocation: "comments", fileName: "comment.webp" },
    };
    const profile = {
      uid: "user-1",
      name: "Private Name",
      email: "private@example.test",
      avatarMeta: {
        storageBucket: "media",
        storageLocation: "avatars",
        fileName: "avatar.webp",
        downloadToken: "token",
        contentType: "image/webp",
        sizeBytes: 100,
      },
      deletedAt: null as Date | null,
    };
    let job: AccountDeletionJob = {
      userId: profile.uid,
      avatarMeta: profile.avatarMeta,
      avatarDeletedAt: null,
      authDeletedAt: null,
      completedAt: null,
      attemptCount: 1,
      lastFailedStep: null,
    };
    const deletionRepository: AccountDeletionRepository = {
      begin: vi.fn(async () => {
        profile.name = "";
        profile.email = "";
        profile.deletedAt = new Date();
        return { ...job };
      }),
      completeStep: vi.fn(async (_uid, step) => {
        const now = new Date();
        job = {
          ...job,
          avatarMeta: step === "avatar" ? null : job.avatarMeta,
          avatarDeletedAt:
            step === "avatar" ? now : job.avatarDeletedAt,
          authDeletedAt: step === "auth" ? now : job.authDeletedAt,
        };
        return { ...job };
      }),
      recordFailure: vi.fn(async () => undefined),
    };
    const deleteAvatar = vi.fn(async () => {
      profile.avatarMeta = null as never;
    });
    const deleteAuth = vi.fn(async () => undefined);
    const processor = new ProcessAccountDeletionUseCase(
      deletionRepository,
      { deleteUser: deleteAuth } as never,
      deleteAvatar,
    );
    const coordinator = vi.fn((uid: string) => processor.execute(uid));

    await expect(
      new AdminService(adminSession, coordinator).adminDeleteUser("user-1"),
    ).resolves.toEqual({ state: "completed" });

    expect(coordinator).toHaveBeenCalledWith("user-1");
    expect(userRepository.deleteUser).not.toHaveBeenCalled();
    expect(authRepository.deleteUser).not.toHaveBeenCalled();
    expect(profile).toMatchObject({
      uid: "user-1",
      name: "",
      email: "",
      avatarMeta: null,
    });
    expect(profile.deletedAt).toBeInstanceOf(Date);
    expect(retainedPost).toEqual({
      id: "post-1",
      imageMeta: { storageLocation: "posts", fileName: "post.webp" },
    });
    expect(retainedComment).toEqual({
      id: "comment-1",
      imageMeta: { storageLocation: "comments", fileName: "comment.webp" },
    });
    expect(deleteAvatar).toHaveBeenCalledWith(
      expect.objectContaining({ storageLocation: "avatars" }),
    );
    expect(deleteAuth).toHaveBeenCalledWith("user-1");
  });
});
