import {
  imageMetaToJson,
  parseImageMeta,
} from "@/features/images/utils/imageMeta";
import { parseDate } from "@/features/shared/utils/dateUtils";
import { normalizeDisplayName } from "@/features/users/utils/displayName";
import { UserRole } from "../../types/user.type";
import type { ImageMeta } from "@/features/images/types/image.type";
import type { UserEntity } from "../../types/user.entity";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRestrictionPayload,
} from "../../types/user.payload";
import type {
  UserInsertRow,
  UserRow,
  UserSummaryRow,
  UserUpdateRow,
} from "../../types/user.row";

export type UserSummary = {
  name: string;
  avatarMeta?: ImageMeta | null;
};

function toDbTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toUserRole(value: string): UserRole {
  if (value === UserRole.Admin || value === UserRole.Moderator) {
    return value;
  }
  return UserRole.User;
}

export function mapUserRow(row: UserRow): UserEntity {
  return {
    uid: row.uid,
    name: row.display_name,
    hasUsername: row.display_name.trim().length > 0,
    email: row.email,
    role: toUserRole(row.role),
    avatarMeta: parseImageMeta(row.avatar_meta) ?? undefined,
    createdAt: parseDate(row.created_at) ?? new Date(0),
    updatedAt: parseDate(row.updated_at),
    lastOnline: parseDate(row.last_online) ?? new Date(0),
    isActive: row.is_active ?? undefined,
    isBanned: row.is_banned ?? undefined,
    bannedAt: parseDate(row.banned_at),
    bannedBy: row.banned_by ?? undefined,
    bannedReason: row.banned_reason ?? undefined,
    isRestricted: row.is_restricted ?? undefined,
    restrictedAt: parseDate(row.restricted_at),
    restrictedBy: row.restricted_by ?? undefined,
    restrictionReason: row.restriction_reason ?? undefined,
    lastKnownIp: row.last_known_ip ?? undefined,
  };
}

export function mapUserSummaryRow(row: UserSummaryRow): UserSummary {
  return {
    name: row.display_name,
    avatarMeta: parseImageMeta(row.avatar_meta),
  };
}

export function toCreateUserRow(data: CreateUserPayload): UserInsertRow {
  const displayName = data.name.trim();
  const now = new Date().toISOString();

  return {
    uid: data.uid,
    display_name: displayName,
    display_name_normalized: normalizeDisplayName(displayName),
    email: data.email,
    role: data.role ?? UserRole.User,
    avatar_meta: imageMetaToJson(data.avatarMeta),
    created_at: now,
    updated_at: now,
    last_online: now,
  };
}

export function toOAuthPendingUserRow(data: {
  uid: string;
  email: string;
}): UserInsertRow {
  const now = new Date().toISOString();

  return {
    uid: data.uid,
    display_name: "",
    display_name_normalized: "",
    email: data.email,
    role: UserRole.User,
    avatar_meta: null,
    created_at: now,
    updated_at: now,
    last_online: now,
  };
}

export function toBlockUserRow(data: {
  bannedBy: string;
  bannedReason: string;
}): UserUpdateRow {
  return {
    is_banned: true,
    banned_at: new Date().toISOString(),
    banned_by: data.bannedBy,
    banned_reason: data.bannedReason,
    updated_at: new Date().toISOString(),
  };
}

export function toUnblockUserRow(): UserUpdateRow {
  return {
    is_banned: false,
    banned_at: null,
    banned_by: null,
    banned_reason: null,
    updated_at: new Date().toISOString(),
  };
}

export function toRestrictionUpdateRow({
  isRestricted,
  restrictedBy,
  restrictedReason,
}: UpdateUserRestrictionPayload): UserUpdateRow {
  const row: UserUpdateRow = {
    is_restricted: isRestricted,
    updated_at: new Date().toISOString(),
  };

  if (isRestricted) {
    row.restricted_at = new Date().toISOString();
    row.restricted_by = restrictedBy ?? null;
    row.restriction_reason = restrictedReason ?? null;
  } else {
    row.restricted_at = null;
    row.restricted_by = null;
    row.restriction_reason = null;
  }

  return row;
}

export function toUpdateUserRow(data: UpdateUserPayload): UserUpdateRow {
  const row: UserUpdateRow = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) {
    const displayName = data.name.trim();
    row.display_name = displayName;
    row.display_name_normalized = normalizeDisplayName(displayName);
  }
  if (data.email !== undefined) row.email = data.email;
  if (data.role !== undefined) row.role = data.role;
  if (data.avatarMeta !== undefined) {
    row.avatar_meta = imageMetaToJson(data.avatarMeta);
  }
  if (data.lastOnline !== undefined) {
    row.last_online = toDbTimestamp(data.lastOnline);
  }
  if (data.isActive !== undefined) row.is_active = data.isActive;
  if (data.lastKnownIp !== undefined) row.last_known_ip = data.lastKnownIp;

  return row;
}
