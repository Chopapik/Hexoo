import { adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/ApiError";
import { Like } from "../types/like.type";
import { FieldValue } from "firebase-admin/firestore";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

export async function toggleLike(
  parentId: string,
  parentCollectionName: "posts" | "comments"
) {
  const user = await getUserFromSession();

  if (!parentId) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[likeService.toggleLike] Resource ID is missing.",
    });
  }

  const parentRef = adminDb.collection(parentCollectionName).doc(parentId);

  const likeId = `${parentId}_${user.uid}`;

  const likeRef = adminDb.collection("likes").doc(likeId);

  return await adminDb.runTransaction(async (transaction) => {
    const parentSnap = await transaction.get(parentRef);
    const likeSnap = await transaction.get(likeRef);

    if (!parentSnap.exists) {
      throw createAppError({
        code: "NOT_FOUND",
        message: `[likeService.toggleLike] Resource with id: ${parentId} from collection ${parentCollectionName}, not found`,
      });
    }

    const currentLikesCount = parentSnap.data()?.likesCount || 0;

    if (likeSnap.exists) {
      transaction.delete(likeRef);

      transaction.update(parentRef, {
        likesCount: Math.max(0, currentLikesCount - 1),
      });
    } else {
      transaction.set(likeRef, {
        parentId,
        userId: user.uid,
        likedAt: FieldValue.serverTimestamp(),
      } as Like);

      transaction.update(parentRef, {
        likesCount: currentLikesCount + 1,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  });
}
