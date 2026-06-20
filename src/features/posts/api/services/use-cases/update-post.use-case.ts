import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import type { ImageMeta } from "@/features/images/types/image.type";
import {
  deleteImageWithRetry,
  rollbackUploadedImage,
} from "@/features/images/api/image-cleanup";

import type { PostRepository } from "../../repositories/post.repository.interface";
import type { PostContentService } from "../post.content.service";
import type { PostEnricher } from "../post.enricher";
import type { PostModerationWorkflow } from "../post.moderation-workflow";

import {
  PublicPostResponseDto as PublicPostResponse,
  UpdatePostRequestDto as UpdatePostRequest,
  UpdatePostSchema,
} from "../../../types/post.dto";

import {
  assertPostAuthor,
  assertPostExists,
  assertPostId,
  requireSession,
} from "../post.guards";

type ImageDeleter = (meta: ImageMeta | null | undefined) => Promise<void>;

export class UpdatePostUseCase {
  constructor(
    private readonly repository: PostRepository,
    private readonly contentService: PostContentService,
    private readonly moderationWorkflow: PostModerationWorkflow,
    private readonly enricher: PostEnricher,
    private readonly imageDeleter: ImageDeleter,
    private readonly session: SessionData | null,
  ) {}

  async execute(
    postId: string,
    updateData: UpdatePostRequest,
  ): Promise<PublicPostResponse> {
    const user = requireSession(this.session);
    assertPostId(postId, "UpdatePostUseCase");

    const parsed = UpdatePostSchema.safeParse(updateData);

    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "Invalid update data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const data = parsed.data;

    const post = await this.repository.getPostById(postId);
    assertPostExists(post, "UpdatePostUseCase");
    assertPostAuthor(post, user.uid);

    const nextText = data.text ?? post.text;

    const processed = await this.contentService.process(
      user.uid,
      nextText,
      "posts",
      data.imageFile,
    );

    let updatedPost;
    try {
      await this.moderationWorkflow.recordContentModerationResult(
        postId,
        processed.moderationLogPayloadForResource,
      );

      updatedPost = await this.repository.updatePost(postId, {
        text: nextText,
        imageMeta: processed.imageMeta ?? post.imageMeta,
        isPending: processed.isPending,
        isNSFW: processed.isNSFW,
        isEdited: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      return rollbackUploadedImage(
        processed.imageMeta,
        error,
        this.imageDeleter,
      );
    }

    // The old object remains valid until the DB no longer references it.
    if (processed.imageMeta && post.imageMeta) {
      await deleteImageWithRetry(post.imageMeta, this.imageDeleter);
    }

    await logActivity(user.uid, "POST_UPDATED", `User updated post ${postId}`);

    return this.enricher.enrichOne(updatedPost, this.session);
  }
}
