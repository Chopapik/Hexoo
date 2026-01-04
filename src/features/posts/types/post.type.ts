import { firestore } from "firebase-admin";
import z from "zod";

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

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  text: string;

  imageUrl?: string | null;
  imageMeta?: ImageMeta | null;

  device?: string | null;
  likesCount: number;
  isLikedByMe?: boolean;
  commentsCount: number;

  createdAt: firestore.Timestamp | firestore.FieldValue;
  updatedAt?: firestore.Timestamp | firestore.FieldValue;

  userReports?: string[];
  reportsMeta?: ReportDetails[];
  moderationStatus: "approved" | "pending" | "rejected";
  flaggedReasons?: string[];
  isNSFW: boolean;

  reviewedBy?: string;
  reviewedAt?: firestore.Timestamp | Date;
}

export const CreatePostSchema = z.object({
  text: z.string().trim().max(POST_MAX_CHARS, { message: "text_too_long" }),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "file_too_big")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "wrong_file_type"
    ),
  device: z.string().optional(),
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
