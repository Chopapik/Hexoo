import z from "zod";
import { firestore } from "firebase-admin";
import { ContentBase } from "@/features/shared/types/content.type";

export const POST_MAX_CHARS = 1000;

export interface ReportDetails {
  uid: string;
  reason: string;
  details?: string;
  createdAt: firestore.Timestamp | Date;
}

export interface ImageMeta {
  publicUrl: string;
  storagePath: string;
  downloadToken: string;
  contentType: string;
  sizeBytes: number;
}

type PostTimestamp = firestore.Timestamp | firestore.FieldValue | Date;

export interface Post extends ContentBase<PostTimestamp> {
  imageUrl?: string | null;
  imageMeta?: ImageMeta | null;

  device?: string | null;
  commentsCount: number;

  userReports?: string[];
  reportsMeta?: ReportDetails[];

  reviewedBy?: string;
  reviewedAt?: firestore.Timestamp | Date;
}

export const CreatePostSchema = z
  .object({
    text: z.string().trim().max(POST_MAX_CHARS, { message: "text_too_long" }),
    imageFile: z
      .instanceof(File)
      .optional()
      .refine((file) => !file || file.size <= 5 * 1024 * 1024, "file_too_big")
      .refine(
        (file) =>
          !file ||
          ["image/png", "image/jpeg", "image/webp"].includes(file.type),
        "wrong_file_type"
      ),
    device: z.string().optional(),
  })
  .refine((data) => data.text.length > 0 || !!data.imageFile, {
    message: "post_empty",
    path: ["text"],
  });

export type CreatePost = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z.object({
  text: z
    .string()
    .trim()
    .max(POST_MAX_CHARS, { message: "text_too_long" })
    .optional(),
  imageFile: z.instanceof(File).optional(),
  device: z.string().optional(),
});

export type UpdatePost = z.infer<typeof UpdatePostSchema>;
