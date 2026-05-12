import { createAppError } from "@/lib/AppError";
import { logActivity } from "@/features/activity/api/services";
import { ModerationStatus } from "@/features/shared/types/content.type";
import {
  logModerationEvent,
  type ModerationLogPayload,
} from "@/features/moderation/api/services/moderationLog.service";

import type { PostRepository } from "../repositories/post.repository.interface";
import type { PostEntity } from "../../types/post.entity";

type ContentModerationPayload =
  | Omit<ModerationLogPayload, "resourceType" | "resourceId">
  | null
  | undefined;

export class PostModerationWorkflow {
  constructor(private readonly repository: PostRepository) {}

  async recordContentModerationResult(
    postId: string,
    payload: ContentModerationPayload,
  ): Promise<void> {
    if (!payload) return;

    await logModerationEvent({
      ...payload,
      resourceType: "post",
      resourceId: postId,
    });
  }

  async setModerationStatus(
    postId: string,
    status: ModerationStatus.Approved | ModerationStatus.Pending,
  ): Promise<void> {
    const post = await this.repository.getPostById(postId);

    if (!post) {
      throw createAppError({
        code: "NOT_FOUND",
        message: "Post not found",
      });
    }

    await this.repository.updatePost(postId, {
      isPending: status === ModerationStatus.Pending,
    });

    await logActivity(
      post.userId,
      "POST_MODERATION_STATUS_CHANGED",
      `Moderation status of post ${postId} changed to ${status}`,
    );
  }

  async recordUserReport(params: {
    post: PostEntity;
    postId: string;
    reporterId: string;
    reason: string;
    details?: string;
  }): Promise<void> {
    const { post, postId, reporterId, reason, details } = params;

    await logModerationEvent({
      userId: post.userId,
      timestamp: new Date(),
      verdict: ModerationStatus.Pending,
      categories: [reason],
      actionTaken: "FLAGGED_FOR_REVIEW",
      resourceType: "post",
      resourceId: postId,
      source: "user_report",
      actorId: reporterId,
      reasonSummary: "Post reported by user",
      reasonDetails: details ? `${reason}: ${details}` : reason,
    });
  }

  async recordReportThresholdHidden(params: {
    post: PostEntity;
    postId: string;
    reporterId: string;
    reason: string;
    details?: string;
  }): Promise<void> {
    const { post, postId, reporterId, reason, details } = params;

    await logModerationEvent({
      userId: post.userId,
      timestamp: new Date(),
      verdict: ModerationStatus.Pending,
      categories: [reason],
      actionTaken: "FLAGGED_FOR_REVIEW",
      resourceType: "post",
      resourceId: postId,
      source: "user_report",
      actorId: reporterId,
      reasonSummary: "Post hidden after multiple user reports",
      reasonDetails: details,
    });
  }
}
