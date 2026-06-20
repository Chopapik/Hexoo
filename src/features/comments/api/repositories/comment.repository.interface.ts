import type { CommentEntity } from "../../types/comment.entity";
import type {
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../../types/comment.payload";
import type { ReportDetails } from "@/features/shared/types/report.type";
import type { ImageMeta } from "@/features/images/types/image.type";

export interface CommentRepository {
  createComment(
    postId: string,
    data: CreateCommentPayload,
  ): Promise<string>;
  getCommentById(commentId: string): Promise<CommentEntity | null>;
  getCommentsByPostId(postId: string): Promise<CommentEntity[]>;
  getImageMetasByPostId(postId: string): Promise<ImageMeta[]>;
  getCommentsPendingModeration(
    limit: number,
    startAfterId?: string,
  ): Promise<CommentEntity[]>;
  updateComment(
    commentId: string,
    data: UpdateCommentPayload,
  ): Promise<CommentEntity>;
  deleteComment(commentId: string, postId: string): Promise<void>;
  reportComment(
    commentId: string,
    reportDetails: ReportDetails,
  ): Promise<{ hidden: boolean; reportsCount: number }>;
}
