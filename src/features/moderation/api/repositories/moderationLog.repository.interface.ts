import type { ModerationStatus } from "@/features/shared/types/content.type";

export type ModerationActionTaken =
  | "BLOCKED_CREATION"
  | "FLAGGED_FOR_REVIEW"
  | "CONTENT_REMOVED";

export interface ModerationLogPayload {
  userId: string;
  timestamp?: Date;
  verdict: ModerationStatus;
  categories: string[];
  actionTaken: ModerationActionTaken;
  resourceType?: "post" | "comment";
  resourceId?: string;
  source?: "ai" | "user_report" | "moderator";
  actorId?: string;
  reasonSummary?: string;
  reasonDetails?: string;
}

export interface ModerationLogRepository {
  log(payload: ModerationLogPayload): Promise<void>;

  getLatestForResource(
    resourceType: string,
    resourceId: string,
  ): Promise<ModerationLogPayload | null>;

  getAllForResource(
    resourceType: string,
    resourceId: string,
  ): Promise<ModerationLogPayload[]>;

  getLatestForUser(
    userId: string
  ): Promise<ModerationLogPayload | null>;

  getAllForUser(
    userId: string
  ): Promise<ModerationLogPayload[]>;
}

export interface ModerationLogRepository {
  log(payload: ModerationLogPayload): Promise<void>;
  getLatestForResource(
    resourceType: string,
    resourceId: string,
  ): Promise<ModerationLogPayload | null>;
}
