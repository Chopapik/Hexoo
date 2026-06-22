import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "../../../me.type";
import type { ProcessAccountDeletionUseCase } from "./process-account-deletion.use-case";

export class DeleteAccountUseCase {
  constructor(
    private readonly session: SessionData,
    private readonly processAccountDeletion: ProcessAccountDeletionUseCase,
  ) {}

  async execute() {
    const { uid } = this.session;
    const result = await this.processAccountDeletion.execute(uid);
    await logActivity(
      uid,
      "USER_DELETED",
      `User requested account deletion (${result.state})`,
    ).catch(() => undefined);
    return result;
  }
}
