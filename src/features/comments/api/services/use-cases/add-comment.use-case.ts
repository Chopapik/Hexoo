import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";
import type { PostContentService } from "@/features/posts/api/services/post.content.service";

import type { CommentRepository } from "../../repositories/comment.repository.interface";
import {
  AddCommentRequestDto as AddCommentRequest,
  AddCommentResponseDto as AddCommentResponse,
  AddCommentSchema,
} from "../../../types/comment.dto";
import type { CreateCommentPayload } from "../../../types/comment.payload";

import { assertNotRestricted, requireSession } from "../comment.guards";
import {
  rollbackUploadedImage,
  type ImageDeleter,
} from "@/features/images/api/image-cleanup";
import { toModerationContext } from "@/features/moderation/api/repositories/moderationLog.supabase.mapper";

export class AddCommentUseCase {
  constructor(
    private readonly repository: CommentRepository,
    private readonly contentService: PostContentService,
    private readonly session: SessionData | null,
    private readonly imageDeleter: ImageDeleter,
  ) {}

  async execute(data: AddCommentRequest): Promise<AddCommentResponse> {
    const user = requireSession(this.session);
    assertNotRestricted(user);

    const parsed = AddCommentSchema.safeParse(data);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[AddCommentUseCase] Invalid validation",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { text, postId, imageFile } = parsed.data;
    const processed = await this.contentService.process(
      user.uid,
      text,
      "comments",
      imageFile,
    );

    const now = new Date();
    const payload: CreateCommentPayload = {
      postId,
      userId: user.uid,
      text,
      likesCount: 0,
      commentsCount: 0,
      createdAt: now,
      updatedAt: now,
      isPending: processed.isPending,
      moderationStatus: processed.isPending ? "pending" : "visible",
      moderationContext: toModerationContext(
        processed.moderationLogPayloadForResource,
      ),
      isNSFW: processed.isNSFW,
      isEdited: false,
      imageMeta: processed.imageMeta ?? null,
    };

    try {
      await this.repository.createComment(postId, payload);
    } catch (error) {
      return rollbackUploadedImage(
        processed.imageMeta,
        error,
        this.imageDeleter,
      );
    }

    await logActivity(
      user.uid,
      "COMMENT_ADDED",
      `User added a comment to post ${postId}`,
    );

    return {
      isPending: processed.isPending,
      isNSFW: processed.isNSFW,
    };
  }
}
