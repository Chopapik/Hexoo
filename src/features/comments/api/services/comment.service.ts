import { createAppError } from "@/lib/AppError";
import { formatZodErrorFlat } from "@/lib/zod";
import { performModeration } from "@/features/moderation/utils/assessSafety";
import { getUsersByIds } from "@/features/users/api/services";
import { uploadImage, hasFile } from "@/features/images/api/image.service";
import { resolveImagePublicUrl } from "@/features/images/utils/resolveImagePublicUrl";
import type { SessionData } from "@/features/me/me.type";
import type { LikeRepository } from "@/features/likes/api/repositories";
import type { CommentRepository } from "../repositories/comment.repository.interface";
import type {
  AddCommentRequestDto as AddCommentRequest,
  AddCommentResponseDto as AddCommentResponse,
  PublicCommentResponseDto as PublicCommentResponse,
  UpdateCommentRequestDto as UpdateCommentRequest,
} from "../../types/comment.dto";
import { AddCommentSchema, UpdateCommentSchema } from "../../types/comment.dto";
import type { CreateCommentPayload } from "../../types/comment.payload";
import type { CommentService as ICommentService } from "./comment.service.interface";
import { logActivity } from "@/features/activity/api/services";

type AddCommentInput = AddCommentRequest;
type AddCommentResult = AddCommentResponse;
type UpdateCommentInput = UpdateCommentRequest;
type PublicComment = PublicCommentResponse;

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

  async addComment(data: AddCommentInput): Promise<AddCommentResult> {
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

    let imageData: Pick<CreateCommentPayload, "imageMeta"> = {};
    if (hasFile(imageFile) && imageFile instanceof File) {
      const upload = await uploadImage(imageFile, user.uid, "comments");
      imageData = {
        imageMeta: {
          storageBucket: upload.storageBucket,
          storageLocation: upload.storageLocation,
          fileName: upload.fileName,
          downloadToken: upload.downloadToken,
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

    return {
      isPending,
      isNSFW,
    };
  }

  async updateComment(
    commentId: string,
    data: UpdateCommentInput,
  ): Promise<PublicComment> {
    const user = this.ensureUser();

    const parsed = UpdateCommentSchema.safeParse(data);
    if (!parsed.success) {
      throw createAppError({
        code: "VALIDATION_ERROR",
        message: "[commentService.updateComment] Invalid data",
        data: { details: formatZodErrorFlat(parsed.error) },
      });
    }

    const comment = await this.repository.getCommentById(commentId);
    if (!comment) {
      throw createAppError({ code: "NOT_FOUND", message: "Comment not found" });
    }

    if (comment.userId !== user.uid) {
      throw createAppError({
        code: "FORBIDDEN",
        message: "Not author of comment",
      });
    }

    const { isPending, isNSFW } = await performModeration(
      user.uid,
      data.text,
      undefined,
    );

    await this.repository.updateComment(commentId, {
      text: data.text,
      isEdited: true,
      isPending,
      isNSFW,
      updatedAt: new Date(),
    });

    await logActivity(
      user.uid,
      "COMMENT_UPDATED",
      `User updated comment ${commentId}`,
    );

    const comments = await this.getCommentsByPostId(comment.postId);
    const updated = comments.find((c) => c.id === commentId);
    if (!updated) {
      throw createAppError({ code: "NOT_FOUND", message: "Comment not found after update" });
    }
    return updated;
  }

  async deleteComment(commentId: string): Promise<void> {
    const user = this.ensureUser();

    const comment = await this.repository.getCommentById(commentId);
    if (!comment) {
      throw createAppError({ code: "NOT_FOUND", message: "Comment not found" });
    }

    if (comment.userId !== user.uid) {
      throw createAppError({
        code: "FORBIDDEN",
        message: "Not author of comment",
      });
    }

    await this.repository.deleteComment(commentId, comment.postId);

    await logActivity(
      user.uid,
      "COMMENT_DELETED",
      `User deleted comment ${commentId}`,
    );
  }

  async getCommentsByPostId(postId: string): Promise<PublicComment[]> {
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
        imageUrl: resolveImagePublicUrl(doc.imageMeta) ?? null,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: resolveImagePublicUrl(author?.avatarMeta) ?? null,
        isLikedByMe: likedCommentIds.includes(doc.id),
      } satisfies PublicComment;
    });
  }
}
