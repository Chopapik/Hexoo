import type { SessionData } from "../../me.type";
import type { UpdateProfileData } from "../../me.type";
import { MeService } from "./me.service";
import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";

export const getMeService = (session: SessionData): MeService => {
  return new MeService(session, userRepository, authRepository);
};

export async function deleteAccount(session: SessionData) {
  const service = getMeService(session);
  return await service.deleteAccount();
}

export async function updateProfile(
  session: SessionData,
  data: UpdateProfileData,
) {
  const service = getMeService(session);
  return await service.updateProfile(data);
}

export async function updatePassword(session: SessionData, data: any) {
  const service = getMeService(session);
  return await service.updatePassword(data);
}

export { MeService };
