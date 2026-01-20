import { ILikeRepository } from "../likeRepository.interface";
import { Like } from "@/features/likes/types/like.type";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { createAppError } from "@/lib/AppError";

export class FirebaseLikeRepository implements ILikeRepository {
  private collection = adminDb.collection("likes");

  async toggleLike(
    userId: string,
    parentId: string,
    parentCollection: "posts" | "comments",
  ): Promise<void> {
    const parentRef = adminDb.collection(parentCollection).doc(parentId);
    const likeId = `${parentId}_${userId}`;
    const likeRef = this.collection.doc(likeId);

    await adminDb.runTransaction(async (transaction) => {
      const parentSnap = await transaction.get(parentRef);
      const likeSnap = await transaction.get(likeRef);

      if (!parentSnap.exists) {
        throw createAppError({
          code: "NOT_FOUND",
          message: `Resource with id: ${parentId} from collection ${parentCollection}, not found`,
        });
      }

      if (likeSnap.exists) {
        transaction.delete(likeRef);
        transaction.update(parentRef, {
          likesCount: FieldValue.increment(-1),
        });
      } else {
        transaction.set(likeRef, {
          parentId,
          userId,
          likedAt: FieldValue.serverTimestamp(),
        } as Like);

        transaction.update(parentRef, {
          likesCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });
  }

  async getLikesForParents(
    userId: string,
    parentIds: string[],
  ): Promise<string[]> {
    if (!userId || parentIds.length === 0) return [];

    const likesQuery = await this.collection
      .where("userId", "==", userId)
      .where("parentId", "in", parentIds)
      .get();

    return likesQuery.docs.map((doc) => doc.data().parentId);
  }
}
