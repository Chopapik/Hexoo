import { authRepository } from "../repositories";
import { userRepository } from "@/features/users/api/repositories";
import { logActivity } from "@/features/activity/api/services";
import { AuthService } from "./auth.service";

export const getAuthService = (): AuthService => {
  return new AuthService(authRepository, userRepository, logActivity);
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
