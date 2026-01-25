import { z } from "zod";
import { Post } from "./post.entity";

export const CreatePostSchema = z
  .object({
    text: z.string().max(2000, "text_too_long"),
    imageFile: z.instanceof(File).optional(),
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
  imageFile: z.instanceof(File).optional(),
});

export const ReportPostSchema = z.object({
  reason: z.string().min(1),
  details: z.string().optional(),
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
export type ReportPostDto = z.infer<typeof ReportPostSchema>;

export type PostResponseDto = Post & {
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
