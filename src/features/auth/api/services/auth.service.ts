import type { SessionData } from "@/features/me/me.type";

import type {
  AuthService as IAuthService,
  CompleteOAuthProfileResult,
  OAuthLoginResult,
} from "./auth.service.interface";

import type { LogoutUserUseCase } from "./use-cases/logout-user.use-case";
import type { RestoreUserSessionUseCase } from "./use-cases/restore-user-session.use-case";
import type { CreateSessionUseCase } from "./use-cases/create-session.use-case";
import type { RegisterUserUseCase } from "./use-cases/register-user.use-case";
import type { CheckEmailAvailabilityUseCase } from "./use-cases/check-email-availability.use-case";
import type { CheckUsernameAvailabilityUseCase } from "./use-cases/check-username-availability.use-case";
import type { OAuthLoginUseCase } from "./use-cases/oauth-login.use-case";
import type { CompleteOAuthProfileUseCase } from "./use-cases/complete-oauth-profile.use-case";

export class AuthService implements IAuthService {
  constructor(
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly restoreUserSessionUseCase: RestoreUserSessionUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly checkEmailAvailabilityUseCase: CheckEmailAvailabilityUseCase,
    private readonly checkUsernameAvailabilityUseCase: CheckUsernameAvailabilityUseCase,
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
    private readonly completeOAuthProfileUseCase: CompleteOAuthProfileUseCase,
  ) {}

  async logoutUser() {
    return this.logoutUserUseCase.execute();
  }

  async restoreUserSession(): Promise<SessionData | null> {
    return this.restoreUserSessionUseCase.execute();
  }

  async createSession(idToken: string, refreshToken?: string) {
    return this.createSessionUseCase.execute(idToken, refreshToken);
  }

  async registerUser(data: {
    idToken: string;
    name: string;
    email: string;
    refreshToken?: string;
  }) {
    return this.registerUserUseCase.execute(data);
  }

  async checkEmailAvailability(email: string) {
    return this.checkEmailAvailabilityUseCase.execute(email);
  }

  async checkUsernameAvailability(username: string) {
    return this.checkUsernameAvailabilityUseCase.execute(username);
  }

  async oauthLogin(data: {
    idToken: string;
    refreshToken?: string;
  }): Promise<OAuthLoginResult> {
    return this.oauthLoginUseCase.execute(data);
  }

  async completeOAuthProfile(data: {
    idToken: string;
    refreshToken?: string;
    name: string;
  }): Promise<CompleteOAuthProfileResult> {
    return this.completeOAuthProfileUseCase.execute(data);
  }
}
