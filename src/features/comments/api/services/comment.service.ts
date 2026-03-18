import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { performModeration } from "@/features/moderation/utils/assessSafety";
import { getUsersByIds } from "@/features/users/api/services";
import { uploadImage, hasFile } from "@/features/images/api/image.service";
import type { SessionData } from "@/features/me/me.type";
import type { LikeRepository } from "@/features/likes/api/repositories";
import type { CommentRepository } from "../repositories/comment.repository.interface";
import type {
  AddCommentDto,
  PublicCommentDto,
} from "../../types/comment.dto";
import { AddCommentSchema } from "../../types/comment.dto";
import type { CreateCommentPayload } from "../../types/comment.payload";
import type { CommentService as ICommentService } from "./comment.service.interface";
import { logActivity } from "@/features/activity/api/services";

export class CommentService implements ICommentService {
  constructor(
    private readonly repository: CommentRepository,
    private readonly likeRepository: LikeRepository,
    private readonly session: SessionData | null = null,
  ) {}

  private ensureUser(): SessionData {
    if (!this.session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[commentService] User session required",
      });
    }
    return this.session;
  }

  private validateRestricted(user: SessionData) {
    if (user.isRestricted) {
      throw createAppError({
        code: "FORBIDDEN",
        data: { reason: "account_restricted" },
      });
    }
  }

  async addComment(data: AddCommentDto): Promise<void> {
    const user = this.ensureUser();
    this.validateRestricted(user);

    const parsed = AddCommentSchema.safeParse(data);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[commentService.addComment] Invalid validation",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const { text, postId, imageFile } = parsed.data;
    const { isPending, isNSFW } = await performModeration(
      user.uid,
      text,
      imageFile,
    );

    let imageData: Pick<CreateCommentPayload, "imageUrl" | "imageMeta"> = {};
    if (hasFile(imageFile) && imageFile instanceof File) {
      const upload = await uploadImage(imageFile, user.uid, "comments");
      imageData = {
        imageUrl: upload.publicUrl,
        imageMeta: {
          storagePath: upload.storagePath,
          downloadToken: upload.downloadToken,
          publicUrl: upload.publicUrl,
          contentType: upload.contentType,
          sizeBytes: upload.sizeBytes,
        },
      };
    }

    const now = new Date();
    const payload: CreateCommentPayload = {
      postId,
      userId: user.uid,
      text,
      likesCount: 0,
      commentsCount: 0,
      createdAt: now,
      updatedAt: now,
      isPending,
      isNSFW,
      ...imageData,
    };

    await this.repository.createComment(postId, payload);

    await logActivity(
      user.uid,
      "COMMENT_ADDED",
      `User added a comment to post ${postId}`,
    );
  }

  async getCommentsByPostId(postId: string): Promise<PublicCommentDto[]> {
    if (!postId?.trim()) {
      throw createAppError({
        code: "INVALID_INPUT",
        message: "[commentService.getCommentsByPostId] Empty postId",
      });
    }

    const commentDocs = await this.repository.getCommentsByPostId(postId);
    if (commentDocs.length === 0) return [];

    const authorIds = [...new Set(commentDocs.map((c) => c.userId))];
    const authors = await getUsersByIds(authorIds);

    const likedCommentIds =
      this.session && commentDocs.length > 0
        ? await this.likeRepository.getLikesForParents(
            this.session.uid,
            commentDocs.map((c) => c.id),
          )
        : [];

    return commentDocs.map((doc) => {
      const author = authors[doc.userId];
      return {
        ...doc,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: author?.avatarUrl ?? null,
        isLikedByMe: likedCommentIds.includes(doc.id),
      } satisfies PublicCommentDto;
    });
  }
}
