import { PostEntity } from "./post.entity";

export type CreatePostPayload = Partial<Omit<PostEntity, "id">>;

export type UpdatePostPayload = Partial<
  Omit<PostEntity, "id" | "createdAt" | "userId">
>;
