import z from "zod";

export const DeviceSchema = z.object({
  type: z.enum(["Mobile", "Tablet", "Desktop", "Unknown"]),
  os: z.string().trim().max(50, { message: "os_name_too_long" }),
  browser: z.string().trim().max(50, { message: "browser_name_too_long" }),
});

export type DeviceInfo = z.infer<typeof DeviceSchema>;

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  text: string;
  imageUrl?: string | null;
  device?: DeviceInfo | null;
  likesCount: number;
  isLikedByMe?: boolean;
  commentsCount: number;
  createdAt: any;
  updatedAt?: any;
}

export const CreatePostSchema = z.object({
  text: z.string().trim().max(1000, { message: "text_too_long" }),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, "file_too_big")
    .refine(
      (file) =>
        !file || ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      "wrong_file_type"
    ),
  device: DeviceSchema,
});

export type CreatePost = z.infer<typeof CreatePostSchema>;

export const UpdatePostSchema = z.object({
  text: z.string().trim().max(1000, { message: "text_too_long" }).optional(),
  imageFile: z.instanceof(File).optional(),
});

export type UpdatePost = z.infer<typeof UpdatePostSchema>;
