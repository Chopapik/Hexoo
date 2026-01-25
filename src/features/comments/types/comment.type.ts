import z from "zod";
import { firestore } from "firebase-admin";
import { ContentBase } from "@/features/shared/types/content.type";

export const COMMENT_MAX_CHARS = 500;

type CommentTimestamp = firestore.Timestamp | firestore.FieldValue;

export interface Comment extends ContentBase {
  postId: string;
  flaggedSource?: "text" | "image";
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
