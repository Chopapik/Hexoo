import z from "zod";

export const COMMENT_MAX_CHARS = 500;

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  text: string;
  likesCount: number;
  createdAt: Date;
  updatedAt?: Date;
  isLikedByMe?: boolean;
}

export const AddCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { message: "comment_empty" })
    .max(COMMENT_MAX_CHARS, { message: "comment_too_long" }),
  postId: z.string().min(1, { message: "post_id_required" }),
});

export type AddCommentDto = z.infer<typeof AddCommentSchema>;
