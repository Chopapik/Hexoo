import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { UserEntity } from "@/features/users/types/user.entity";
import { UserRole } from "@/features/users/types/user.type";
import { AuthSessionMapper } from "../auth.session.mapper";

const mocks = vi.hoisted(() => ({
  resolveImagePublicUrl: vi.fn(),
}));

vi.mock("@/features/images/utils/resolveImagePublicUrl", () => ({
  resolveImagePublicUrl: mocks.resolveImagePublicUrl,
}));

const avatarMeta: ImageMeta = {
  storageBucket: "avatar-bucket",
  storageLocation: "avatars/user-session-1",
  fileName: "avatar.webp",
  downloadToken: "avatar-token-1",
  contentType: "image/webp",
  sizeBytes: 4321,
};

function userEntity(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    uid: "trusted-user-1",
    email: "trusted.db@example.test",
    name: "Trusted DB Name",
    hasUsername: true,
    role: UserRole.Moderator,
    avatarMeta,
    createdAt: new Date("2026-07-01T08:00:00.000Z"),
    updatedAt: new Date("2026-07-02T08:00:00.000Z"),
    lastOnline: new Date("2026-07-03T08:00:00.000Z"),
    isActive: true,
    isBanned: false,
    ...overrides,
  };
}

describe("AuthSessionMapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveImagePublicUrl.mockReturnValue(
      "https://cdn.example.test/avatar.webp",
    );
  });

  it("maps trusted user entity fields and prefers the token email", () => {
    const user = userEntity({
      uid: "trusted-user-token-1",
      email: "db.email@example.test",
      name: "Trusted Entity Name",
      role: UserRole.Admin,
      isRestricted: true,
      isBanned: true,
      lastOnline: new Date("2026-07-04T12:00:00.000Z"),
    });

    const session = new AuthSessionMapper().mapUserToSessionData(
      user,
      "token.email@example.test",
    );

    expect(session).toEqual({
      uid: "trusted-user-token-1",
      email: "token.email@example.test",
      name: "Trusted Entity Name",
      role: UserRole.Admin,
      avatarUrl: "https://cdn.example.test/avatar.webp",
      lastOnline: new Date("2026-07-04T12:00:00.000Z"),
      isRestricted: true,
      isBanned: true,
    });
    expect(mocks.resolveImagePublicUrl).toHaveBeenCalledWith(avatarMeta);
  });

  it("falls back to DB email and defaults missing restriction state to false", () => {
    const session = new AuthSessionMapper().mapUserToSessionData(
      userEntity({
        email: "fallback.db@example.test",
        isRestricted: undefined,
        isBanned: false,
      }),
      null,
    );

    expect(session.email).toBe("fallback.db@example.test");
    expect(session.isRestricted).toBe(false);
    expect(session.isBanned).toBe(false);
  });

  it("uses empty app-session email but undefined OAuth email when no email exists", () => {
    const user = userEntity({
      email: "",
      avatarMeta: undefined,
    });
    mocks.resolveImagePublicUrl.mockReturnValue(null);

    const mapper = new AuthSessionMapper();

    expect(mapper.mapUserToSessionData(user, undefined)).toMatchObject({
      email: "",
      avatarUrl: undefined,
    });
    expect(mapper.toOAuthSessionUser(user, undefined)).toMatchObject({
      email: undefined,
      avatarUrl: undefined,
    });
  });
});
