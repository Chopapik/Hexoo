import { z } from "zod";
import type { CommentEntity } from "./comment.entity";

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

export type AddCommentRequestDto = z.infer<typeof AddCommentSchema>;
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
  userName: string;
  userAvatarUrl: string | null;
  isLikedByMe?: boolean;
};
