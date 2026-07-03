import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { Json } from "@/lib/supabase.database.types";
import type { UserRow, UserSummaryRow } from "../../../types/user.row";
import { UserRole } from "../../../types/user.type";
import {
  mapUserRow,
  mapUserSummaryRow,
  toBlockUserRow,
  toCreateUserRow,
  toOAuthPendingUserRow,
  toRestrictionUpdateRow,
  toUnblockUserRow,
  toUpdateUserRow,
} from "../user.supabase.mapper";

const nowIso = "2026-07-03T12:34:56.789Z";

const avatarMeta: ImageMeta = {
  storageBucket: "avatars",
  storageLocation: "avatars/user-1",
  fileName: "avatar.webp",
  downloadToken: "download-token",
  contentType: "image/webp",
  sizeBytes: 12345,
  isAnimated: false,
};

const avatarMetaJson: Json = {
  storageBucket: avatarMeta.storageBucket,
  storageLocation: avatarMeta.storageLocation,
  fileName: avatarMeta.fileName,
  downloadToken: avatarMeta.downloadToken,
  contentType: avatarMeta.contentType,
  sizeBytes: avatarMeta.sizeBytes,
  isAnimated: avatarMeta.isAnimated,
};

function userRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    uid: "user-1",
    display_name: "Ada Lovelace",
    display_name_normalized: "ada lovelace",
    email: "ada@example.test",
    role: UserRole.Moderator,
    avatar_meta: null,
    avatar_url: null,
    created_at: "2026-06-01T10:15:30.000Z",
    updated_at: "2026-06-02T11:16:31.000Z",
    session_invalidated_at: "2026-06-03T12:17:32.000Z",
    deleted_at: null,
    last_online: "2026-06-04T13:18:33.000Z",
    is_active: true,
    is_banned: true,
    banned_at: "2026-06-05T14:19:34.000Z",
    banned_by: "admin-1",
    banned_reason: "policy violation",
    is_restricted: true,
    restricted_at: "2026-06-06T15:20:35.000Z",
    restricted_by: "moderator-1",
    restriction_reason: "cooldown",
    last_known_ip: "203.0.113.9",
    ...overrides,
  };
}

describe("user.supabase.mapper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(nowIso));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("mapUserRow", () => {
    it("maps snake_case DB fields to camelCase entity fields", () => {
      const entity = mapUserRow(userRow());

      expect(entity).toMatchObject({
        uid: "user-1",
        name: "Ada Lovelace",
        hasUsername: true,
        email: "ada@example.test",
        role: UserRole.Moderator,
        avatarMeta: undefined,
        updatedAt: new Date("2026-06-02T11:16:31.000Z"),
        sessionInvalidatedAt: new Date("2026-06-03T12:17:32.000Z"),
        deletedAt: undefined,
        isActive: true,
        isBanned: true,
        bannedAt: new Date("2026-06-05T14:19:34.000Z"),
        bannedBy: "admin-1",
        bannedReason: "policy violation",
        isRestricted: true,
        restrictedAt: new Date("2026-06-06T15:20:35.000Z"),
        restrictedBy: "moderator-1",
        restrictionReason: "cooldown",
        lastKnownIp: "203.0.113.9",
      });
      expect(entity.createdAt).toEqual(new Date("2026-06-01T10:15:30.000Z"));
      expect(entity.lastOnline).toEqual(new Date("2026-06-04T13:18:33.000Z"));
    });

    it.each([
      ["non-empty display name", "  Ada  ", true],
      ["blank display name", "   ", false],
    ])("derives hasUsername from trimmed %s", (_caseName, displayName, expected) => {
      const entity = mapUserRow(userRow({ display_name: displayName }));

      expect(entity.name).toBe(displayName);
      expect(entity.hasUsername).toBe(expected);
    });

    it("falls back unknown role values to user", () => {
      const entity = mapUserRow(userRow({ role: "owner" }));

      expect(entity.role).toBe(UserRole.User);
    });

    it("parses avatar metadata", () => {
      const entity = mapUserRow(
        userRow({
          avatar_meta: {
            ...avatarMetaJson,
            storageLocation: "/avatars/user-1",
          },
        }),
      );

      expect(entity.avatarMeta).toEqual(avatarMeta);
    });

    it.each([
      ["invalid", "not-a-date"],
      ["missing", undefined],
    ])(
      "falls back to epoch date when created_at is %s",
      (_caseName, createdAt) => {
        const entity = mapUserRow(
          userRow({ created_at: createdAt as unknown as string }),
        );

        expect(entity.createdAt).toEqual(new Date(0));
      },
    );

    it.each([
      ["invalid", "not-a-date"],
      ["missing", undefined],
    ])(
      "falls back to epoch date when last_online is %s",
      (_caseName, lastOnline) => {
        const entity = mapUserRow(
          userRow({ last_online: lastOnline as unknown as string }),
        );

        expect(entity.lastOnline).toEqual(new Date(0));
      },
    );
  });

  describe("mapUserSummaryRow", () => {
    it("maps summary rows to name and avatarMeta", () => {
      const summaryRow: UserSummaryRow = {
        uid: "user-1",
        display_name: "Ada",
        avatar_meta: avatarMetaJson,
        deleted_at: null,
      };

      expect(mapUserSummaryRow(summaryRow)).toEqual({
        name: "Ada",
        avatarMeta,
      });
    });

    it("maps missing summary avatar metadata to null", () => {
      const summaryRow: UserSummaryRow = {
        uid: "user-1",
        display_name: "Ada",
        avatar_meta: null,
        deleted_at: null,
      };

      expect(mapUserSummaryRow(summaryRow)).toEqual({
        name: "Ada",
        avatarMeta: null,
      });
    });
  });

  describe("toCreateUserRow", () => {
    it("trims name and writes normalized display_name", () => {
      const row = toCreateUserRow({
        uid: "user-1",
        name: "  Ada Lovelace  ",
        email: "ada@example.test",
        role: UserRole.Moderator,
      });

      expect(row).toMatchObject({
        uid: "user-1",
        display_name: "Ada Lovelace",
        display_name_normalized: "ada lovelace",
        email: "ada@example.test",
        role: UserRole.Moderator,
        avatar_meta: null,
        created_at: nowIso,
        updated_at: nowIso,
        last_online: nowIso,
      });
    });

    it("defaults missing role to safe user role", () => {
      const row = toCreateUserRow({
        uid: "user-1",
        name: "Ada",
        email: "ada@example.test",
        role: undefined,
      } as Parameters<typeof toCreateUserRow>[0]);

      expect(row.role).toBe(UserRole.User);
    });

    it("serializes avatar metadata", () => {
      const row = toCreateUserRow({
        uid: "user-1",
        name: "Ada",
        email: "ada@example.test",
        role: UserRole.User,
        avatarMeta,
      });

      expect(row.avatar_meta).toEqual(avatarMetaJson);
    });
  });

  describe("toOAuthPendingUserRow", () => {
    it("writes blank display name and safe user role", () => {
      const row = toOAuthPendingUserRow({
        uid: "oauth-user",
        email: "oauth@example.test",
      });

      expect(row).toMatchObject({
        uid: "oauth-user",
        display_name: "",
        display_name_normalized: "",
        email: "oauth@example.test",
        role: UserRole.User,
        avatar_meta: null,
        created_at: nowIso,
        updated_at: nowIso,
        last_online: nowIso,
      });
    });
  });

  describe("toUpdateUserRow", () => {
    it("omits undefined optional fields while keeping updated_at", () => {
      const row = toUpdateUserRow({
        name: undefined,
        email: undefined,
        role: undefined,
        avatarMeta: undefined,
        lastOnline: undefined,
        sessionInvalidatedAt: undefined,
        isActive: undefined,
        lastKnownIp: undefined,
      });

      expect(row).toEqual({ updated_at: nowIso });
    });

    it("maps only provided fields", () => {
      const row = toUpdateUserRow({
        name: "  Grace Hopper  ",
        email: "grace@example.test",
        role: UserRole.Admin,
        isActive: false,
        lastKnownIp: "198.51.100.7",
      });

      expect(row).toEqual({
        updated_at: nowIso,
        display_name: "Grace Hopper",
        display_name_normalized: "grace hopper",
        email: "grace@example.test",
        role: UserRole.Admin,
        is_active: false,
        last_known_ip: "198.51.100.7",
      });
    });

    it("preserves string timestamps and serializes Date timestamps", () => {
      const row = toUpdateUserRow({
        lastOnline: "2026-07-01T01:02:03.000Z",
        sessionInvalidatedAt: new Date("2026-07-02T04:05:06.000Z"),
      });

      expect(row).toMatchObject({
        updated_at: nowIso,
        last_online: "2026-07-01T01:02:03.000Z",
        session_invalidated_at: "2026-07-02T04:05:06.000Z",
      });
    });

    it("serializes avatar metadata", () => {
      const row = toUpdateUserRow({ avatarMeta });

      expect(row.avatar_meta).toEqual(avatarMetaJson);
    });

    it("serializes explicit avatar null to clear metadata", () => {
      const row = toUpdateUserRow({
        avatarMeta: null,
      } as Parameters<typeof toUpdateUserRow>[0]);

      expect(row).toMatchObject({
        updated_at: nowIso,
        avatar_meta: null,
      });
    });
  });

  describe("ban row helpers", () => {
    it("sets ban fields", () => {
      expect(
        toBlockUserRow({
          bannedBy: "moderator-1",
          bannedReason: "spam",
        }),
      ).toEqual({
        is_banned: true,
        banned_at: nowIso,
        banned_by: "moderator-1",
        banned_reason: "spam",
        updated_at: nowIso,
      });
    });

    it("clears ban fields", () => {
      expect(toUnblockUserRow()).toEqual({
        is_banned: false,
        banned_at: null,
        banned_by: null,
        banned_reason: null,
        updated_at: nowIso,
      });
    });
  });

  describe("restriction row helpers", () => {
    it("sets restriction fields", () => {
      expect(
        toRestrictionUpdateRow({
          uid: "user-1",
          isRestricted: true,
          restrictedBy: "moderator-1",
          restrictedReason: "cooldown",
        }),
      ).toEqual({
        is_restricted: true,
        restricted_at: nowIso,
        restricted_by: "moderator-1",
        restriction_reason: "cooldown",
        updated_at: nowIso,
      });
    });

    it("clears restriction fields", () => {
      expect(
        toRestrictionUpdateRow({
          uid: "user-1",
          isRestricted: false,
        }),
      ).toEqual({
        is_restricted: false,
        restricted_at: null,
        restricted_by: null,
        restriction_reason: null,
        updated_at: nowIso,
      });
    });
  });
});
