import z from "zod";

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  text: string;
  imageUrl?: string | null;
  device?: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  updatedAt?: any;
}
export const CreatePostSchema = z.object({
  text: z.string().trim().max(1000, { message: "text_to_long" }),
  imageFile: z.instanceof(File).optional(),
  device: z.string().optional(),
});

export type CreatePost = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z.object({
  text: z.string().trim().max(1000, { message: "text_to_long" }).optional(),
  imageFile: z.instanceof(File).optional(),
});

export type UpdatePost = z.infer<typeof UpdatePostSchema>;
