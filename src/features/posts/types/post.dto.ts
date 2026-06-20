import { z } from "zod";
import { PostEntity } from "./post.entity";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { CanonicalContentStatus } from "@/features/moderation/types/moderation.type";
import { isValidYouTubeUrl } from "../utils/youtubeUtils";
import { isFileLike } from "@/features/images/utils/isFileLike";
import {
  IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
} from "@/features/images/image-resource-policy";

export const MAX_IMAGE_FILE_SIZE_BYTES = IMAGE_UPLOAD_MAX_BYTES;
export const POST_MAX_CHARS = 2048;

export const CreatePostSchema = z
  .object({
    text: z.string().max(POST_MAX_CHARS, "text_too_long"),
    imageFile: z
      .custom<File>(isFileLike, "wrong_file_type")
      .optional()
      .refine(
        (file) => !file || file.size <= MAX_IMAGE_FILE_SIZE_BYTES,
        "file_too_big",
      )
      .refine(
        (file) =>
          !file ||
          IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(
            file.type as (typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES)[number],
          ),
        "wrong_file_type",
      ),
    youtubeUrl: z
      .string()
      .optional()
      .default("")
      .refine(
        (val) => val.trim() === "" || isValidYouTubeUrl(val),
        "invalid_youtube_url",
      ),
  })
  .refine(
    (data) => {
      const hasText = data.text.trim().length > 0;
      const hasImage = isFileLike(data.imageFile);
      const hasYoutube = !!data.youtubeUrl?.trim();
      return hasText || hasImage || hasYoutube;
    },
    {
      message: "post_empty",
      path: ["text"],
    },
  );

export const UpdatePostSchema = z.object({
  text: z.string().min(1).max(POST_MAX_CHARS, "text_too_long").optional(),
  imageFile: z
    .custom<File>(isFileLike, "wrong_file_type")
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_IMAGE_FILE_SIZE_BYTES,
      "file_too_big",
    )
    .refine(
      (file) =>
        !file ||
        IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(
          file.type as (typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES)[number],
        ),
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
  moderationStatus: CanonicalContentStatus;
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
