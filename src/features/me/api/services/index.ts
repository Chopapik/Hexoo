import type { SessionData, UpdatePasswordData } from "../../me.type";
import type { UpdateProfileData } from "../../me.type";
import { MeService } from "./me.service";
import { authRepository } from "@/features/auth/api/repositories";
import { userRepository } from "@/features/users/api/repositories";
import { accountDeletionRepository } from "../repositories";
import { deleteImage } from "@/features/images/api/image.service";
import {
  DeleteAccountUseCase,
  UpdateProfileUseCase,
  UpdatePasswordUseCase,
} from "./use-cases";
import { ProcessAccountDeletionUseCase } from "./use-cases/process-account-deletion.use-case";

const processAccountDeletionUseCase = new ProcessAccountDeletionUseCase(
  accountDeletionRepository,
  authRepository,
  deleteImage,
);

export const getMeService = (session: SessionData): MeService => {
  const deleteAccountUseCase = new DeleteAccountUseCase(
    session,
    processAccountDeletionUseCase,
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

export async function processAccountDeletion(uid: string) {
  return processAccountDeletionUseCase.execute(uid);
}

export type { AccountDeletionResult } from "./use-cases/process-account-deletion.use-case";

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
