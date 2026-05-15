import {
  clearAllAuthCookies,
  getSessionCookie,
} from "@/features/auth/api/utils/session.cookies";
import type { ActivityType } from "@/features/activity/api/services";

import type { AuthRepository } from "../../repositories/authRepository.interface";

type ActivityLogger = (
  userId: string,
  action: ActivityType,
  details: string,
) => Promise<void>;

export class LogoutUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logActivity: ActivityLogger,
  ) {}

  async execute() {
    try {
      const session = await getSessionCookie();
      if (session.session && session.value) {
        const decoded = await this.authRepository.verifyIdToken(session.value);
        await this.logActivity(decoded.uid, "LOGOUT", "User logged out");
      }
    } catch {
      // Ignore: no valid session to log
    }
    await clearAllAuthCookies();
    return { message: "Session cleared" };
  }
}
