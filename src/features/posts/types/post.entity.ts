import { ContentBase } from "@/features/shared/types/content.type";
import { ImageMeta, ReportDetails } from "./post.type";

export interface Post extends ContentBase {
  imageUrl?: string | null;
  imageMeta?: ImageMeta | null;

  device?: string | null;
  commentsCount: number;

  userReports?: string[];
  reportsMeta?: ReportDetails[];

  reviewedBy?: string;
  reviewedAt?: Date;
}
