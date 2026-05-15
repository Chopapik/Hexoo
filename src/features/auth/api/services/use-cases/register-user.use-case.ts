import { createAppError } from "@/lib/AppError";
import {
  setSessionCookie,
  setRefreshCookie,
} from "@/features/auth/api/utils/session.cookies";
import { isUsernameTaken } from "../../utils/checkUsernameUnique";
import type { ActivityType } from "@/features/activity/api/services";
import { UserRole } from "@/features/users/types/user.type";

import type { AuthRepository } from "../../repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";

import { AuthSessionMapper } from "../auth.session.mapper";
import { SESSION_EXPIRES_MS } from "../auth.session.issuer";

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userRepository: UserRepository,
    private readonly logActivity: ActivityLogger,
    private readonly mapper: AuthSessionMapper,
  ) {}

  async execute(data: {
    idToken: string;
    name: string;
    email: string;
    refreshToken?: string;
  }) {
    const { idToken, name } = data;

    const decodedToken = await this.authRepository.verifyIdToken(idToken);

    const { uid, email } = decodedToken;
    const displayName = name.trim();

    if (!displayName) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[authService.registerUser] Display name is required.",
        details: { field: "name" },
      });
    }

    if (await isUsernameTaken(displayName)) {
      throw createAppError({
        code: "CONFLICT",
        message: `[authService.registerUser] Display name '${displayName}' is already taken.`,
        details: { field: "name" },
      });
    }

    try {
      await this.userRepository.createUser({
        uid,
        name: displayName,
        email: email ?? "",
        role: UserRole.User,
      });

      await this.logActivity(uid, "USER_CREATED", "Account created");
    } catch {
      throw createAppError({
        code: "DB_ERROR",
        message:
          "[authService.registerUser] Failed to create user document in database.",
      });
    }

    const sessionCookie = await this.authRepository.createSessionCookie(
      idToken,
      SESSION_EXPIRES_MS,
    );

    await setSessionCookie(sessionCookie);
    if (data.refreshToken) await setRefreshCookie(data.refreshToken);

    const createdUser = await this.userRepository.getUserByUid(uid);

    return {
      user: createdUser
        ? {
            ...this.mapper.mapUserToSessionData(createdUser, email),
            email: (email ?? createdUser.email) || undefined,
            role: "user" as const,
          }
        : {
            uid,
            name: displayName,
            email: email ?? undefined,
            role: "user" as const,
          },
    };
  }
}
