import type { ModerationStatus } from "@/features/shared/types/content.type";

export type ModerationActionTaken =
  | "BLOCKED_CREATION"
  | "FLAGGED_FOR_REVIEW"
  | "CONTENT_REMOVED";

export interface ModerationLogEntry {
  userId: string;
  timestamp?: Date;
  verdict: ModerationStatus;
  categories: string[];
  actionTaken: ModerationActionTaken;
}

export interface ModerationLogRepository {
  log(entry: ModerationLogEntry): Promise<void>;
}
