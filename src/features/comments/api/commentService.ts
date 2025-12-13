import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/ApiError";
import { AddCommentSchema, AddCommentDto } from "../types/comment.type";
import { formatZodErrorFlat } from "@/lib/zod";
import { performModeration } from "@/features/moderation/utils/assessSafety";

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
    await performModeration(text);

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
      userName: user.name,
      userAvatarUrl: user.avatarUrl ?? null,
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
