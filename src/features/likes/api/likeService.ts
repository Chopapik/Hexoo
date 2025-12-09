import { adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "../../auth/api/utils/verifySession";
import { createAppError } from "@/lib/ApiError";
import { Like } from "../types/like.type";
import { FieldValue } from "firebase-admin/firestore";

export async function toggleLike(
  resourceId: string,
  collectionName: "posts" | "comments"
) {
  const user = await getUserFromSession();

  if (!resourceId) {
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[likeService.toggleLike] Resource ID is missing.",
    });
  }

  const parentRef = adminDb.collection(collectionName).doc(resourceId);

  const likeRef = parentRef.collection("likes").doc(user.uid);

  return await adminDb.runTransaction(async (transaction) => {
    const resourceDoc = await transaction.get(parentRef);
    const likeDoc = await transaction.get(likeRef);

    if (!resourceDoc.exists) {
      throw createAppError({
        code: "NOT_FOUND",
        message: `[likeService.toggleLike] Resource with id: ${resourceId}  from collection  ${collectionName}, not found`,
      });
    }

    const resourceData = resourceDoc.data();

    const currentCount = resourceData?.likesCount || 0;

    let newCount = currentCount;
    let isLiked = false;

    if (likeDoc.exists) {
      transaction.delete(likeRef);
      newCount = Math.max(0, currentCount - 1);
      isLiked = false;
    } else {
      const newLike: Like = {
        uid: user.uid,
        userName: user.name,
        userAvatarUrl: user.avatarUrl ?? null,
        likedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(likeRef, newLike);
      newCount = currentCount + 1;
      isLiked = true;
    }

    transaction.update(parentRef, {
      likesCount: newCount,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { isLiked, likesCount: newCount };
  });
}
