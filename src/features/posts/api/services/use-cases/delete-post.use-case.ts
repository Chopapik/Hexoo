import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import type { ImageMeta } from "@/features/images/types/image.type";

import type { PostRepository } from "../../repositories/post.repository.interface";

import {
  assertPostAuthor,
  assertPostExists,
  assertPostId,
  requireSession,
} from "../post.guards";

type ImageDeleter = (meta: ImageMeta | null | undefined) => Promise<void>;

export class DeletePostUseCase {
  constructor(
    private readonly repository: PostRepository,
    private readonly imageDeleter: ImageDeleter,
    private readonly session: SessionData | null,
  ) {}

  async execute(postId: string): Promise<void> {
    const user = requireSession(this.session);
    assertPostId(postId, "DeletePostUseCase");

    const post = await this.repository.getPostById(postId);
    assertPostExists(post, "DeletePostUseCase");
    assertPostAuthor(post, user.uid);

    if (post.imageMeta) {
      await this.imageDeleter(post.imageMeta);
    }

    await this.repository.deletePost(postId);

    await logActivity(user.uid, "POST_DELETED", `User deleted post ${postId}`);
  }
}
