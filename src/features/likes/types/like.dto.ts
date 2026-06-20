import { z } from "zod";

export type LikeParentCollection = "posts" | "comments";

export const SetLikeStateSchema = z.object({
  liked: z.boolean(),
});

export type SetLikeStateRequestDto = z.infer<typeof SetLikeStateSchema>;

export interface SetLikeStateResponseDto {
  liked: boolean;
  likesCount: number;
}
