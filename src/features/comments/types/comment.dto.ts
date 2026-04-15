import { z } from "zod";
import type { CommentEntity } from "./comment.entity";
import type { ModerationStatus } from "@/features/shared/types/content.type";

export const COMMENT_MAX_CHARS = 500;
export const COMMENT_MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const AddCommentSchema = z
  .object({
    text: z.string().max(COMMENT_MAX_CHARS, { message: "comment_too_long" }),
    imageFile: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => !file || file.size <= COMMENT_MAX_IMAGE_FILE_SIZE_BYTES,
        "file_too_big",
      )
      .refine(
        (file) =>
          !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
        "wrong_file_type",
      ),
    postId: z.string().min(1, { message: "post_id_required" }),
  })
  .refine(
    (data) => {
      const hasText = data.text.trim().length > 0;
      const hasImage = data.imageFile instanceof File;
      return hasText || hasImage;
    },
    {
      message: "comment_empty",
      path: ["text"],
    },
  );

export const UpdateCommentSchema = z.object({
  text: z.string().min(1).max(COMMENT_MAX_CHARS, { message: "comment_too_long" }),
});

export type AddCommentRequestDto = z.infer<typeof AddCommentSchema>;
export type UpdateCommentRequestDto = z.infer<typeof UpdateCommentSchema>;
export type AddCommentResponseDto = {
  isPending: boolean;
  isNSFW: boolean;
};

export type PublicCommentResponseDto = Omit<
  CommentEntity,
  | "flaggedReasons"
  | "flaggedSource"
  | "userReports"
  | "reportsMeta"
  | "reviewedBy"
  | "reviewedAt"
> & {
  imageUrl?: string | null;
  userName: string;
  userAvatarUrl: string | null;
  isLikedByMe?: boolean;
};

export const REPORT_REASONS = [
  "spam",
  "hate",
  "nudity",
  "harassment",
  "other",
] as const;

export const REPORT_DETAILS_MAX_CHARS = 300;

export const ReportCommentSchema = z
  .object({
    reason: z.enum(REPORT_REASONS, { message: "report_reason_required" }),
    details: z
      .string()
      .max(REPORT_DETAILS_MAX_CHARS, { message: "report_details_too_long" })
      .optional()
      .default(""),
  })
  .refine(
    (data) => data.reason !== "other" || (data.details ?? "").trim().length > 0,
    { message: "report_details_required", path: ["details"] },
  );

export type ReportCommentRequestDto = z.infer<typeof ReportCommentSchema>;

export interface CommentReportRequestDto {
  commentId: string;
  reason: string;
  details?: string;
}

/** Parent post snapshot for a comment in the moderation queue. */
export type ModerationCommentParentPostPreview = {
  id: string;
  text: string;
  userName: string;
  userAvatarUrl: string | null;
  hasImage: boolean;
  /** Post image URL (thumbnail + lightbox in moderator UI) */
  imageUrl?: string | null;
  isNSFW: boolean;
};

export type ModerationCommentResponseDto = CommentEntity & {
  imageUrl?: string | null;
  moderationStatus: ModerationStatus;
  flaggedReasons?: string[];
  moderationInfo?: {
    verdict: ModerationStatus;
    actionTaken: string;
    categories: string[];
    reasonSummary?: string;
    reasonDetails?: string;
    source?: string;
    actorId?: string;
  };
  userName: string;
  userAvatarUrl: string | null;
  isLikedByMe?: boolean;
  /** Omitted if the parent post row is missing. */
  parentPostPreview?: ModerationCommentParentPostPreview;
};
