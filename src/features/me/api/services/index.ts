import type { SessionData, UpdatePasswordData } from "../../me.type";
import type { UpdateProfileData } from "../../me.type";
import { MeService } from "./me.service";
import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";
import {
  DeleteAccountUseCase,
  UpdateProfileUseCase,
  UpdatePasswordUseCase,
} from "./use-cases";

export const getMeService = (session: SessionData): MeService => {
  const deleteAccountUseCase = new DeleteAccountUseCase(
    session,
    userRepository,
    authRepository,
  );

  const updateProfileUseCase = new UpdateProfileUseCase(
    session,
    userRepository,
    authRepository,
  );

  const updatePasswordUseCase = new UpdatePasswordUseCase(
    session,
    userRepository,
    authRepository,
  );

  return new MeService(
    deleteAccountUseCase,
    updateProfileUseCase,
    updatePasswordUseCase,
  );
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

export async function updatePassword(
  session: SessionData,
  data: UpdatePasswordData,
) {
  const service = getMeService(session);
  return await service.updatePassword(data);
}

export { MeService };
