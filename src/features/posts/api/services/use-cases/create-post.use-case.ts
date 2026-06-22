import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { logActivity } from "@/features/activity/api/services";
import type { SessionData } from "@/features/me/me.type";

import type { PostRepository } from "../../repositories/post.repository.interface";
import type { PostContentService } from "../post.content.service";
import type { PostModerationWorkflow } from "../post.moderation-workflow";

import {
  CreatePostRequestDto as CreatePostRequest,
  CreatePostResponseDto as CreatePostResponse,
  CreatePostSchema,
} from "../../../types/post.dto";

import type { CreatePostPayload } from "../../../types/post.payload";
import { requireSession } from "../post.guards";
import {
  rollbackUploadedImage,
  type ImageDeleter,
} from "@/features/images/api/image-cleanup";
import { toModerationContext } from "@/features/moderation/api/repositories/moderationLog.supabase.mapper";

export class CreatePostUseCase {
  constructor(
    private readonly repository: PostRepository,
    private readonly contentService: PostContentService,
    _moderationWorkflow: PostModerationWorkflow,
    private readonly session: SessionData | null,
    private readonly imageDeleter: ImageDeleter,
  ) {}

  async execute(
    createPostData: CreatePostRequest,
  ): Promise<CreatePostResponse> {
    const user = requireSession(this.session);

    const parsed = CreatePostSchema.safeParse(createPostData);

    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "Invalid post data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const data = parsed.data;

    const processed = await this.contentService.process(
      user.uid,
      data.text,
      "posts",
      data.imageFile,
    );

    const now = new Date();

    const dbInput: CreatePostPayload = {
      userId: user.uid,
      text: data.text,
      device: "Web",
      imageMeta: processed.imageMeta ?? null,
      isPending: processed.isPending,
      moderationStatus: processed.isPending ? "pending" : "visible",
      moderationContext: toModerationContext(
        processed.moderationLogPayloadForResource,
      ),
      isNSFW: processed.isNSFW,
      likesCount: 0,
      commentsCount: 0,
      userReports: [],
      reportsMeta: [],
      createdAt: now,
      updatedAt: now,
      youtubeUrl: data.youtubeUrl?.trim() || null,
    };

    let postId: string;
    try {
      postId = await this.repository.createPost(dbInput);
    } catch (error) {
      return rollbackUploadedImage(
        processed.imageMeta,
        error,
        this.imageDeleter,
      );
    }

    await logActivity(user.uid, "POST_CREATED", "User created a new post");

    return {
      postId,
      isPending: processed.isPending,
      isNSFW: processed.isNSFW,
    };
  }
}
