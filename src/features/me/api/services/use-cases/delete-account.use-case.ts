import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "../../../me.type";
import type { AuthRepository } from "@/features/auth/api/repositories/authRepository.interface";
import type { UserRepository } from "@/features/users/api/repositories/user.repository.interface";

export class DeleteAccountUseCase {
  constructor(
    private readonly session: SessionData,
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async execute(): Promise<void> {
    const { uid } = this.session;

    await logActivity(uid, "USER_DELETED", "User deleted their own account");

    await this.userRepository.deleteUser(uid);
    await this.authRepository.deleteUser(uid);
  }
}
