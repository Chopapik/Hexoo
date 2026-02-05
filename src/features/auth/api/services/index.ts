import { authRepository } from "../repositories";
import { userRepository } from "@/features/users/api/repositories";
import { resetIpLimit } from "@/features/security/api/services";
import { logActivity } from "@/features/admin/api/services/activityService";
import { AuthService } from "./auth.service";

export const getAuthService = (): AuthService => {
  return new AuthService(authRepository, userRepository, resetIpLimit, logActivity);
};

export async function logoutUser() {
  const service = getAuthService();
  return await service.logoutUser();
}

export async function createSession(idToken: string, ip: string) {
  const service = getAuthService();
  return await service.createSession(idToken, ip);
}

export async function registerUser(data: {
  idToken: string;
  name: string;
  email: string;
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
