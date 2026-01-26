import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/AppError";
import {
  AddCommentSchema,
  AddCommentDto,
  Comment,
} from "../types/comment.type";
import { formatZodErrorFlat } from "@/lib/zod";
import { performModeration } from "@/features/moderation/utils/assessSafety";
import { getUsersByIds } from "@/features/users/api/services";

export const addComment = async (data: AddCommentDto) => {
  const user = await getUserFromSession();

  if (user.isRestricted) {
    throw createAppError({
      code: "FORBIDDEN",
      data: { reason: "account_restricted" },
    });
  }

  const parsed = AddCommentSchema.safeParse(data);
  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[commentService.addComment] Invalid validation",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  const { text, postId } = parsed.data;

  const { moderationStatus, isNSFW, flaggedReasons, flaggedSource } =
    await performModeration(user.uid, text);

  const postRef = adminDb.collection("posts").doc(postId);
  const commentsRef = postRef.collection("comments");

  await adminDb.runTransaction(async (transaction) => {
    const postSnap = await transaction.get(postRef);

    if (!postSnap.exists) {
      throw createAppError({
        code: "NOT_FOUND",
        message: `[commentService.addComment] Post ${postId} does not exist`,
      });
    }

    const newCommentRef = commentsRef.doc();

    const commentDoc = {
      id: newCommentRef.id,
      postId: postId,
      userId: user.uid,
      text,
      likesCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      moderationStatus,
      isNSFW,
      flaggedReasons,
      flaggedSource,
    };

    transaction.set(newCommentRef, commentDoc);

    transaction.update(postRef, {
      commentsCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  return { success: true, postId };
};

export const getCommentsByPostId = async (
  postId: string,
): Promise<Comment[]> => {
  let currentUserUid: string | null = null;
  try {
    const session = await getUserFromSession();
    currentUserUid = session.uid;
  } catch {
    currentUserUid = null;
  }

  const commentsSnap = await adminDb
    .collection("posts")
    .doc(postId)
    .collection("comments")
    .where("moderationStatus", "==", "approved")
    .orderBy("createdAt", "asc")
    .get();

  if (commentsSnap.empty) return [];

  const commentDocs = commentsSnap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Comment,
  );

  const authorIds = [...new Set(commentDocs.map((c) => c.userId))];
  const authors = await getUsersByIds(authorIds);

  let likedCommentIds: string[] = [];
  if (currentUserUid) {
    const likesQuery = await adminDb
      .collection("likes")
      .where("userId", "==", currentUserUid)
      .where(
        "parentId",
        "in",
        commentsSnap.docs.map((d) => d.id),
      )
      .get();
    likedCommentIds = likesQuery.docs.map((doc) => doc.data().parentId);
  }

  return commentDocs.map((doc) => {
    const author = authors[doc.userId];
    return {
      ...doc,
      userName: author?.name ?? "Unknown",
      userAvatarUrl: author?.avatarUrl ?? null,
      isLikedByMe: likedCommentIds.includes(doc.id),
    };
  });
};
