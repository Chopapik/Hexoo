import { authRepository } from "../repositories";
import { userRepository } from "@/features/users/api/repositories";
import { logActivity } from "@/features/activity/api/services";
import { AuthService } from "./auth.service";
import { AuthSessionMapper } from "./auth.session.mapper";
import { AuthSessionIssuer } from "./auth.session.issuer";
import {
  LogoutUserUseCase,
  RestoreUserSessionUseCase,
  CreateSessionUseCase,
  RegisterUserUseCase,
  CheckEmailAvailabilityUseCase,
  CheckUsernameAvailabilityUseCase,
  OAuthLoginUseCase,
  CompleteOAuthProfileUseCase,
} from "./use-cases";

const authSessionMapper = new AuthSessionMapper();
const authSessionIssuer = new AuthSessionIssuer(
  authRepository,
  logActivity,
  authSessionMapper,
);

export const getAuthService = (): AuthService => {
  const logoutUserUseCase = new LogoutUserUseCase(authRepository, logActivity);

  const restoreUserSessionUseCase = new RestoreUserSessionUseCase(
    authRepository,
    userRepository,
    authSessionMapper,
  );

  const createSessionUseCase = new CreateSessionUseCase(
    authRepository,
    userRepository,
    logActivity,
    authSessionMapper,
  );

  const registerUserUseCase = new RegisterUserUseCase(
    authRepository,
    userRepository,
    logActivity,
    authSessionMapper,
  );

  const checkEmailAvailabilityUseCase = new CheckEmailAvailabilityUseCase(
    authRepository,
  );

  const checkUsernameAvailabilityUseCase =
    new CheckUsernameAvailabilityUseCase();

  const oauthLoginUseCase = new OAuthLoginUseCase(
    authRepository,
    userRepository,
    authSessionIssuer,
    logActivity,
  );

  const completeOAuthProfileUseCase = new CompleteOAuthProfileUseCase(
    authRepository,
    userRepository,
    authSessionIssuer,
  );

  return new AuthService(
    logoutUserUseCase,
    restoreUserSessionUseCase,
    createSessionUseCase,
    registerUserUseCase,
    checkEmailAvailabilityUseCase,
    checkUsernameAvailabilityUseCase,
    oauthLoginUseCase,
    completeOAuthProfileUseCase,
  );
};

export async function logoutUser() {
  const service = getAuthService();
  return await service.logoutUser();
}

export async function createSession(idToken: string, refreshToken?: string) {
  const service = getAuthService();
  return await service.createSession(idToken, refreshToken);
}

export async function restoreUserSession() {
  const service = getAuthService();
  return await service.restoreUserSession();
}

export async function registerUser(data: {
  idToken: string;
  name: string;
  email: string;
  refreshToken?: string;
}) {
  const service = getAuthService();
  return await service.registerUser(data);
}

export async function checkEmailAvailability(email: string) {
  const service = getAuthService();
  return await service.checkEmailAvailability(email);
}

export async function checkUsernameAvailability(username: string) {
  const service = getAuthService();
  return await service.checkUsernameAvailability(username);
}

export async function oauthLogin(data: {
  idToken: string;
  refreshToken?: string;
}) {
  const service = getAuthService();
  return await service.oauthLogin(data);
}

export async function completeOAuthProfile(data: {
  idToken: string;
  refreshToken?: string;
  name: string;
}) {
  const service = getAuthService();
  return await service.completeOAuthProfile(data);
}

export { AuthService };
