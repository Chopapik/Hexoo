import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { SessionData } from "@/features/me/me.type";
import type { UserEntity } from "@/features/users/types/user.entity";

import type { OAuthSessionUser } from "./auth.service.interface";

export class AuthSessionMapper {
  mapUserToSessionData(
    userData: UserEntity,
    email?: string | null,
  ): SessionData {
    return {
      uid: userData.uid,
      email: (email ?? userData.email) || "",
      name: userData.name,
      role: userData.role,
      avatarUrl: resolveImagePublicUrl(userData.avatarMeta) ?? undefined,
      lastOnline: userData.lastOnline,
      isRestricted: userData.isRestricted ?? false,
      isBanned: userData.isBanned,
    };
  }

  toOAuthSessionUser(
    userData: UserEntity,
    email?: string | null,
  ): OAuthSessionUser {
    const session = this.mapUserToSessionData(userData, email);
    return {
      ...session,
      email: (email ?? userData.email) || undefined,
    };
  }
}
