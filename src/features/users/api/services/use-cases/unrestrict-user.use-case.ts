import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import type { UserRepository } from "../../repositories/user.repository.interface";
import { assertUid, ensureModeratorOrAdmin } from "../user.guards";

export class UnrestrictUserUseCase {
  constructor(
    private readonly repository: UserRepository,
    private readonly session: SessionData | null,
  ) {}

  async execute(uid: string): Promise<void> {
    ensureModeratorOrAdmin(this.session);
    assertUid(uid, "UnrestrictUserUseCase");

    await this.repository.updateUserRestriction({
      uid,
      isRestricted: false,
    });

    await logActivity(uid, "USER_UNRESTRICTED", "User restriction removed");
  }
}
