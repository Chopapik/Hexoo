import type { UserRepository } from "../../repositories/user.repository.interface";

export class TouchLastOnlineUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(
    uid: string,
    minIntervalMs: number = 5 * 60 * 1000,
  ): Promise<void> {
    if (!uid) return;

    const user = await this.repository.getUserByUid(uid);
    if (!user) return;

    const now = Date.now();
    const lastOnlineTs = user.lastOnline?.getTime?.() ?? 0;
    if (minIntervalMs > 0 && now - lastOnlineTs < minIntervalMs) return;

    await this.repository.updateUser(uid, { lastOnline: new Date(now) });
  }
}
