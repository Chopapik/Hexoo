import { adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/ApiError";
import { Post } from "@/features/posts/types/post.type";
import { FieldValue } from "firebase-admin/firestore";

const ensureModeratorOrAdmin = async () => {
  const session = await getUserFromSession();
  if (session.role !== "moderator" && session.role !== "admin") {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Moderator access required",
    });
  }
  return session;
};

export const getModerationQueue = async () => {
  await ensureModeratorOrAdmin();

  const postsRef = adminDb.collection("posts");

  const pendingSnapshot = await postsRef
    .where("moderationStatus", "==", "pending")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const posts = pendingSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Post[];

  return posts;
};

export const reviewPost = async (
  postId: string,
  action: "approve" | "reject" | "quarantine",
  banAuthor: boolean = false
) => {
  const moderator = await ensureModeratorOrAdmin();

  if (!postId) throw createAppError({ code: "INVALID_INPUT" });

  const postRef = adminDb.collection("posts").doc(postId);
  const postSnap = await postRef.get();

  if (!postSnap.exists) throw createAppError({ code: "NOT_FOUND" });

  const batch = adminDb.batch();

  if (action === "reject") {
    batch.update(postRef, {
      moderationStatus: "rejected",
      reviewedBy: moderator.uid,
      reviewedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "approve") {
    batch.update(postRef, {
      moderationStatus: "approved",
      flaggedReasons: [],
      reviewedBy: moderator.uid,
      reviewedAt: FieldValue.serverTimestamp(),
    });
  } else if (action === "quarantine") {
    batch.update(postRef, {
      moderationStatus: "pending",
      reviewedBy: moderator.uid,
      reviewedAt: FieldValue.serverTimestamp(),
    });
  }

  if (banAuthor) {
    const authorId = postSnap.data()?.userId;
    if (authorId) {
      const userRef = adminDb.collection("users").doc(authorId);
      batch.update(userRef, {
        isBanned: true,
        bannedBy: moderator.uid,
        bannedReason: `Decision on post ${postId}`,
      });
    }
  }

  await batch.commit();
  return { success: true, action, postId };
};
