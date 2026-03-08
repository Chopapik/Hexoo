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

export async function createSession(
  idToken: string,
  ip: string,
  refreshToken?: string
) {
  const service = getAuthService();
  return await service.createSession(idToken, ip, refreshToken);
}

export async function tryRefreshSession() {
  const service = getAuthService();
  return await service.tryRefreshSession();
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

export { AuthService };
