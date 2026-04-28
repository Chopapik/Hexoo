import { z } from "zod";
import { PostEntity } from "./post.entity";
import { ModerationStatus } from "@/features/shared/types/content.type";

export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const POST_MAX_CHARS = 2048;

export const CreatePostSchema = z
  .object({
    text: z.string().max(POST_MAX_CHARS, "text_too_long"),
    imageFile: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => !file || file.size <= MAX_IMAGE_FILE_SIZE_BYTES,
        "file_too_big",
      )
      .refine(
        (file) =>
          !file ||
          ["image/png", "image/jpeg", "image/webp"].includes(file.type),
        "wrong_file_type",
      ),
  })
  .refine(
    (data) => {
      const hasText = data.text.trim().length > 0;
      const hasImage = data.imageFile instanceof File;
      return hasText || hasImage;
    },
    {
      message: "post_empty",
      path: ["text"],
    },
  );

export const UpdatePostSchema = z.object({
  text: z.string().min(1).optional(),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_IMAGE_FILE_SIZE_BYTES,
      "file_too_big",
    )
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "wrong_file_type",
    ),
});

export const REPORT_REASONS = [
  "spam",
  "hate",
  "nudity",
  "harassment",
  "other",
] as const;

export const REPORT_DETAILS_MAX_CHARS = 300;

export const ReportPostSchema = z
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

export type CreatePostRequestDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostRequestDto = z.infer<typeof UpdatePostSchema>;
export type ReportPostRequestDto = z.infer<typeof ReportPostSchema>;
export type CreatePostResponseDto = {
  postId: string;
  isPending: boolean;
  isNSFW: boolean;
};

export type PublicPostResponseDto = Omit<
  PostEntity,
  | "flaggedReasons"
  | "flaggedSource"
  | "reportsMeta"
  | "userReports"
  | "reviewedBy"
  | "reviewedAt"
> & {
  imageUrl?: string | null;
  userName: string;
  userAvatarUrl: string | null;
  isLikedByMe?: boolean;
  moderationInfo?: {
    verdict: ModerationStatus;
    actionTaken: string;
    categories: string[];
    reasonSummary?: string;
    reasonDetails?: string;
    source?: string;
    actorId?: string;
  };
};

export type ModerationPostResponseDto = PostEntity & {
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
};

export interface PostReportRequestDto {
  postId: string;
  reason: string;
  details?: string;
  createdAt?: Date;
}
