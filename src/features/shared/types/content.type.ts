import { ImageMeta } from "@/features/images/types/image.type";
import { ReportDetails } from "@/features/shared/types/report.type";

export enum ModerationStatus {
  Approved = "approved",
  Pending = "pending",
  Rejected = "rejected",
}

export type ContentStatus =
  | "visible"
  | "pending"
  | "quarantined"
  | "rejected";

export interface ContentBase {
  id: string;
  userId: string;
  text: string;

  likesCount: number;
  isLikedByMe?: boolean;

  createdAt: Date;
  updatedAt?: Date;

  isPending?: boolean;
  moderationStatus?: ContentStatus;
  isNSFW: boolean;
  isEdited: boolean;

  imageMeta?: ImageMeta | null;

  device?: string | null;

  youtubeUrl?: string | null;

  commentsCount: number;

  userReports?: string[];
  reportsMeta?: ReportDetails[];

  reviewedBy?: string;
  reviewedAt?: Date;
}
