import type { SessionData } from "@/features/me/me.type";

import type { CommentRepository } from "../../repositories/comment.repository.interface";
import type { PublicCommentResponseDto as PublicCommentResponse } from "../../../types/comment.dto";

import type { CommentEnricher } from "../comment.enricher";
import { assertPostId } from "../comment.guards";

export class GetCommentsByPostIdUseCase {
  constructor(
    private readonly repository: CommentRepository,
    private readonly enricher: CommentEnricher,
    private readonly session: SessionData | null,
  ) {}

  async execute(postId: string): Promise<PublicCommentResponse[]> {
    assertPostId(postId, "GetCommentsByPostIdUseCase");

    const commentDocs = await this.repository.getCommentsByPostId(postId);
    return this.enricher.enrich(commentDocs, this.session);
  }
}
