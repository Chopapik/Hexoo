import {
  clearAllAuthCookies,
  getRefreshCookie,
  setRefreshCookie,
  setSessionCookie,
} from "@/features/auth/api/utils/session.cookies";
import type { SessionData } from "@/features/me/me.type";

import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import { isTokenIssuedBeforeSessionCutoff } from "@/features/auth/api/utils/session-cutoff";

import { AuthSessionMapper } from "../auth.session.mapper";

export class RestoreUserSessionUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly mapper: AuthSessionMapper,
  ) {}

  async execute(): Promise<SessionData | null> {
    const refresh = await getRefreshCookie();
    if (!refresh.hasRefresh) return null;
    try {
      const tokens = await this.authRepository.refreshSession(refresh.value);
      const decoded = await this.authRepository.verifyIdToken(
        tokens.access_token,
      );
      const userData = await this.userRepository.getUserByUid(decoded.uid);
      if (!userData || userData.isBanned || userData.deletedAt) {
        await clearAllAuthCookies();
        return null;
      }
      if (isTokenIssuedBeforeSessionCutoff(tokens.access_token, userData)) {
        await clearAllAuthCookies();
        return null;
      }

      await setSessionCookie(tokens.access_token);
      await setRefreshCookie(tokens.refresh_token);
      return this.mapper.mapUserToSessionData(userData);
    } catch {
      await clearAllAuthCookies();
      return null;
    }
  }
}
