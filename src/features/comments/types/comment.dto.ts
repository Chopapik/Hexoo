import { z } from "zod";
import type { CommentEntity } from "./comment.entity";

export const COMMENT_MAX_CHARS = 500;

export const AddCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { message: "comment_empty" })
    .max(COMMENT_MAX_CHARS, { message: "comment_too_long" }),
  postId: z.string().min(1, { message: "post_id_required" }),
});

export type AddCommentDto = z.infer<typeof AddCommentSchema>;

export type PublicCommentDto = Omit<
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
