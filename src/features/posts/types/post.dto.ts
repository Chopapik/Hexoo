import { z } from "zod";
import { PostEntity } from "./post.entity";

const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const CreatePostSchema = z
  .object({
    text: z.string().max(2000, "text_too_long"),
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

export const ReportPostSchema = z.object({
  reason: z.string().min(1),
  details: z.string().optional(),
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
export type ReportPostDto = z.infer<typeof ReportPostSchema>;

export type PublicPostDto = Omit<
  PostEntity,
  | "flaggedReasons"
  | "flaggedSource"
  | "reportsMeta"
  | "userReports"
  | "reviewedBy"
  | "reviewedAt"
> & {
  userName: string;
  userAvatarUrl: string | null;
  isLikedByMe?: boolean;
};

export type ModerationPostDto = PostEntity & {
  userName: string;
  userAvatarUrl: string | null;
  isLikedByMe?: boolean;
};

export interface PostReportDto {
  postId: string;
  reason: string;
  details?: string;
  createdAt: Date;
}
