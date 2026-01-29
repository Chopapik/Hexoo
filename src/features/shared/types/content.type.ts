import { ImageMeta } from "@/features/images/types/image.type";
import { ReportDetails } from "@/features/shared/types/report.type";

export type ModerationStatus = "approved" | "pending" | "rejected";

export interface ContentBase {
  id: string;
  userId: string;
  text: string;

  likesCount: number;
  isLikedByMe?: boolean;

  createdAt: Date;
  updatedAt?: Date;

  moderationStatus: ModerationStatus;
  flaggedReasons?: string[];
  flaggedSource?: ("text" | "image")[];
  isNSFW: boolean;

  imageUrl?: string | null;
  imageMeta?: ImageMeta | null;

  device?: string | null;

  commentsCount: number;

  userReports?: string[];
  reportsMeta?: ReportDetails[];

  reviewedBy?: string;
  reviewedAt?: Date;
}
