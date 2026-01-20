import { adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/AppError";
import { Post } from "@/features/posts/types/post.type";
import { FieldValue } from "firebase-admin/firestore";
import {
  blockUser,
  getUsersByIds,
} from "@/features/users/api/services/userService";
import { UserBlockData } from "@/features/users/types/user.type";
import { deleteImage } from "@/features/images/api/imageService";

export const ensureModeratorOrAdmin = async () => {
  const session = await getUserFromSession();
  if (session.role !== "moderator" && session.role !== "admin") {
    throw createAppError({
      code: "FORBIDDEN",
      message:
        "[moderatorService.ensureModeratorOrAdmin] Missing moderator/admin role",
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

  if (pendingSnapshot.empty) {
    return [];
  }

  const postDocs = pendingSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Post[];

  const authorIds = [...new Set(postDocs.map((post) => post.userId))];

  const authors = await getUsersByIds(authorIds);

  const postsWithAuthors = postDocs.map((post) => {
    const author = authors[post.userId];
    return {
      ...post,
      userName: author?.name ?? "Unknown",
      userAvatarUrl: author?.avatarUrl ?? null,
    };
  });

  return postsWithAuthors;
};

export const reviewPost = async (
  postId: string,
  action: "approve" | "reject" | "quarantine",
  banAuthor: boolean = false,
) => {
  const moderator = await ensureModeratorOrAdmin();

  if (!postId)
    throw createAppError({
      code: "INVALID_INPUT",
      message: "[moderatorService.reviewPost] postId was empty",
    });

  const postRef = adminDb.collection("posts").doc(postId);

  const transactionResult = await adminDb.runTransaction(
    async (transaction) => {
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists) {
        throw createAppError({
          code: "NOT_FOUND",
          message: "[moderatorService.reviewPost] Post document not found",
        });
      }

      // if (postDoc.data()!.moderationStatus !== "pending") {
      //   throw createAppError({
      //     code: "CONFLICT",
      //     message: "[moderatorService.reviewPost] Post already moderated",
      //   });
      // }

      const postData = postDoc.data() as Post;

      if (action === "reject") {
        transaction.update(postRef, {
          moderationStatus: "rejected",
          reviewedBy: moderator.uid,
          reviewedAt: FieldValue.serverTimestamp(),
        });
        await deleteImage(postData.imageMeta?.storagePath);
      } else if (action === "approve") {
        transaction.update(postRef, {
          moderationStatus: "approved",
          flaggedReasons: [],
          reviewedBy: moderator.uid,
          reviewedAt: FieldValue.serverTimestamp(),
        });
      } else if (action === "quarantine") {
        transaction.update(postRef, {
          moderationStatus: "pending",
          reviewedBy: moderator.uid,
          reviewedAt: FieldValue.serverTimestamp(),
        });
      }

      return { authorId: postData?.userId };
    },
  );

  if (banAuthor && transactionResult.authorId) {
    try {
      await blockUser({
        uidToBlock: transactionResult.authorId,
        bannedBy: moderator.uid,
        bannedReason: `Decision on post ${postId}`,
      } as UserBlockData);
    } catch (error) {
      console.error(
        `[ReviewPost] Failed to ban user ${transactionResult.authorId} after post review.`,
        error,
      );
    }
  }

  return { success: true, action, postId };
};
