import type { RestrictUserRequestDto as RestrictUserRequest } from "../../../types/user.dto";
import type { SessionData } from "@/features/me/me.type";
import { ensureModeratorOrAdmin } from "../user.guards";
import type { UserRestrictionApplier } from "../user.restriction";

export class RestrictUserUseCase {
  constructor(
    private readonly restrictionApplier: UserRestrictionApplier,
    private readonly session: SessionData | null,
  ) {}

  async execute(data: RestrictUserRequest): Promise<void> {
    ensureModeratorOrAdmin(this.session);
    await this.restrictionApplier.apply(data.uid, data.reason, "ADMIN");
  }
}
