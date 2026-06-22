import { createAppError } from "@/lib/AppError";
import type { ActivityType } from "@/features/activity/api/services";

import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";
import type { OAuthLoginResult } from "../auth.service.interface";

import { AuthSessionIssuer } from "../auth.session.issuer";

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;

export class OAuthLoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionIssuer: AuthSessionIssuer,
    private readonly logActivity: ActivityLogger,
  ) {}

  async execute(data: {
    idToken: string;
    refreshToken?: string;
  }): Promise<OAuthLoginResult> {
    const { idToken, refreshToken } = data;

    const decoded = await this.authRepository.verifyIdToken(idToken);
    const { uid, email } = decoded;

    const existing = await this.userRepository.getUserByUid(uid);

    if (existing?.deletedAt) {
      throw createAppError({
        code: "ACCOUNT_DELETED",
        message: "[authService.oauthLogin] User account was deleted",
      });
    }

    if (existing && existing.hasUsername) {
      const user = await this.sessionIssuer.issueAppSession({
        userData: existing,
        idToken,
        refreshToken,
        email,
        activityDetails: "User logged in via OAuth",
      });
      return { status: "LOGGED_IN", user };
    }

    if (!existing) {
      try {
        await this.userRepository.createOAuthPendingUser({
          uid,
          email: email ?? "",
        });
        await this.logActivity(
          uid,
          "USER_CREATED",
          "OAuth account created (pending username)",
        );
      } catch (error) {
        const reread = await this.userRepository.getUserByUid(uid);
        if (!reread) {
          throw createAppError({
            code: "DB_ERROR",
            message:
              "[authService.oauthLogin] Failed to create pending OAuth user record.",
            details: error,
          });
        }
        if (reread.hasUsername) {
          const user = await this.sessionIssuer.issueAppSession({
            userData: reread,
            idToken,
            refreshToken,
            email,
            activityDetails: "User logged in via OAuth",
          });
          return { status: "LOGGED_IN", user };
        }
      }
    }

    return {
      status: "NEEDS_USERNAME",
      uid,
      email: email ?? undefined,
    };
  }
}
