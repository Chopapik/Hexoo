import type { ModerationStatus } from "@/features/shared/types/content.type";
import type { ModerationResourceType } from "@/features/moderation/types/moderation.type";

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
  resourceType?: ModerationResourceType;
  resourceId?: string;
  source?: "ai" | "user_report" | "moderator";
  actorId?: string;
  reasonSummary?: string;
  reasonDetails?: string;
}

export interface ModerationLogRepository {
  log(payload: ModerationLogPayload): Promise<void>;

  getLatestForResource(
    resourceType: ModerationResourceType,
    resourceId: string,
  ): Promise<ModerationLogPayload | null>;

  getAllForResource(
    resourceType: ModerationResourceType,
    resourceId: string,
  ): Promise<ModerationLogPayload[]>;

  getLatestForUser(
    userId: string
  ): Promise<ModerationLogPayload | null>;

  getAllForUser(
    userId: string
  ): Promise<ModerationLogPayload[]>;

  /**
   * Returns the latest moderation log per resourceId for the given resourceType.
   * The returned array contains at most one entry per resourceId.
   */
  getLatestForResources(
    resourceType: ModerationResourceType,
    resourceIds: string[],
  ): Promise<ModerationLogPayload[]>;
}
