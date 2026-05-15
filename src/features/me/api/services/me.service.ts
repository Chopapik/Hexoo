import type { UpdateProfileData, UpdatePasswordData } from "../../me.type";
import type { MeService as IMeService } from "./me.service.interface";

import type { DeleteAccountUseCase } from "./use-cases/delete-account.use-case";
import type { UpdateProfileUseCase } from "./use-cases/update-profile.use-case";
import type { UpdatePasswordUseCase } from "./use-cases/update-password.use-case";

export class MeService implements IMeService {
  constructor(
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  async deleteAccount() {
    return this.deleteAccountUseCase.execute();
  }

  async updateProfile(data: UpdateProfileData) {
    return this.updateProfileUseCase.execute(data);
  }

  async updatePassword(passwordData: UpdatePasswordData) {
    return this.updatePasswordUseCase.execute(passwordData);
  }
}
