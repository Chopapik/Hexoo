import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { createAppError } from "@/lib/AppError";
import { mapDatesFromFirestore } from "@/features/shared/utils/firestoreMappers";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { CommentRepository } from "./comment.repository.interface";
import type { CreateCommentPayload } from "../../types/comment.payload";
import type { CommentEntity } from "../../types/comment.entity";

export class CommentFirebaseRepository implements CommentRepository {
  private get postsCollection() {
    return adminDb.collection("posts");
  }

  async createComment(
    postId: string,
    data: CreateCommentPayload,
  ): Promise<void> {
    const postRef = this.postsCollection.doc(postId);
    const commentsRef = postRef.collection("comments");

    await adminDb.runTransaction(async (transaction) => {
      const postSnap = await transaction.get(postRef);

      if (!postSnap.exists) {
        throw createAppError({
          code: "NOT_FOUND",
          message: `[commentRepository.createComment] Post ${postId} does not exist`,
        });
      }

      const newCommentRef = commentsRef.doc();
      const commentDoc = {
        id: newCommentRef.id,
        ...data,
      };

      transaction.set(newCommentRef, commentDoc);

      transaction.update(postRef, {
        commentsCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
  }

  async getCommentsByPostId(postId: string): Promise<CommentEntity[]> {
    const commentsSnap = await this.postsCollection
      .doc(postId)
      .collection("comments")
      .where("moderationStatus", "==", ModerationStatus.Approved)
      .orderBy("createdAt", "asc")
      .get();

    if (commentsSnap.empty) return [];

    return commentsSnap.docs.map((doc) => {
      const mapped = mapDatesFromFirestore(doc.data());
      return { id: doc.id, ...mapped } as CommentEntity;
    });
  }
}
