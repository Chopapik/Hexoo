import type { UserRestrictionApplier } from "../user.restriction";

export class RestrictUserBySystemUseCase {
  constructor(private readonly restrictionApplier: UserRestrictionApplier) {}

  async execute(uid: string, reason: string): Promise<void> {
    await this.restrictionApplier.apply(uid, reason, "AI_SYSTEM");
  }
}
