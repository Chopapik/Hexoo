import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/AppError";
import {
  CreatePostSchema,
  UpdatePostSchema,
  type CreatePost,
  type UpdatePost,
  type Post,
  ReportDetails,
} from "../types/post.type";
import { formatZodErrorFlat } from "@/lib/zod";
import { deleteImage } from "@/features/images/api/imageService";
import { getUsersByIds, getUserByUid } from "@/features/users/api/userService";
import { FieldValue } from "firebase-admin/firestore";
import processPostContent from "./postHelpers";

const POSTS_COLLECTION = "posts";
const LIKES_COLLECTION = "likes";

const REPORT_THRESHOLD = 3;

export const reportPost = async (
  postId: string,
  reason: string,
  details?: string
) => {
  const user = await getUserFromSession();
  const postRef = adminDb.collection(POSTS_COLLECTION).doc(postId);

  return await adminDb.runTransaction(async (t) => {
    const doc = await t.get(postRef);
    if (!doc.exists) {
      throw createAppError({
        code: "NOT_FOUND",
        message: "[postService.reportPost] Post document not found by ID",
      });
    }

    const data = doc.data()!;
    const reports = data.userReports || [];

    if (reports.includes(user.uid)) {
      throw createAppError({
        code: "CONFLICT",
        message: "[postService.reportPost] User has already reported this post",
      });
    }

    const newReports = [...reports, user.uid];

    const newReportMeta: ReportDetails = {
      uid: user.uid,
      reason: reason,
      details: details || "",
      createdAt: new Date(),
    };

    const shouldHide = newReports.length >= REPORT_THRESHOLD;

    const updateData: any = {
      reportsMeta: FieldValue.arrayUnion(newReportMeta),
      userReports: newReports,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (shouldHide) {
      updateData.moderationStatus = "pending";
      updateData.flaggedReasons =
        admin.firestore.FieldValue.arrayUnion("user_reports");
    }

    t.update(postRef, updateData);

    return {
      hidden: shouldHide,
      reportsCount: newReports.length,
    };
  });
};

export const createPost = async (createPostData: CreatePost) => {
  const user = await getUserFromSession();

  if (user.isRestricted) {
    throw createAppError({
      code: "FORBIDDEN",
      data: { reason: "account_restricted" },
    });
  }

  const parsed = CreatePostSchema.safeParse(createPostData);

  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[postService.createPost] Invalid post data",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  const processed = await processPostContent(
    user.uid,
    createPostData.text,
    createPostData.imageFile
  );

  const postDoc = {
    userId: user.uid,
    text: createPostData.text,
    imageUrl: processed.imageUrl,
    imageMeta: processed.imageMeta,
    likesCount: 0,
    commentsCount: 0,
    device: createPostData.device ?? "Web",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    moderationStatus: processed.moderationStatus,
    isNSFW: processed.isNSFW,
    flaggedReasons: processed.flaggedReasons,
  };

  await adminDb.collection(POSTS_COLLECTION).add(postDoc);
};

export const updatePost = async (postId: string, updateData: UpdatePost) => {
  const user = await getUserFromSession();

  const parsed = UpdatePostSchema.safeParse(updateData);
  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[postService.updatePost] Invalid post updateData",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  const ref = adminDb.collection(POSTS_COLLECTION).doc(postId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw createAppError({
      code: "NOT_FOUND",
      message: "[postService.updatePost] Post not found",
    });
  }

  const post = snap.data()!;

  if (post.userId !== user.uid) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[postService.updatePost] User is not the author of the post",
    });
  }

  const processed = await processPostContent(
    user.uid,
    updateData.text ?? post.text,
    updateData.imageFile
  );

  if (processed.imageUrl && post.imageMeta?.storagePath) {
    await deleteImage(post.imageMeta.storagePath);
  }

  await ref.update({
    text: updateData.text ?? post.text,
    imageUrl: processed.imageUrl ?? post.imageUrl,
    imageMeta: processed.imageMeta ?? post.imageMeta,
    moderationStatus: processed.moderationStatus,
    isNSFW: processed.isNSFW,
    flaggedReasons: processed.flaggedReasons,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return await getPostById(postId);
};

export const getPostById = async (postId: string): Promise<Post> => {
  if (!postId?.trim()) {
    throw createAppError({
      code: "NOT_FOUND",
      message: "[postService.getPostById] Post ID is empty or whitespace",
    });
  }

  const snap = await adminDb.collection(POSTS_COLLECTION).doc(postId).get();
  if (!snap.exists) {
    throw createAppError({
      code: "NOT_FOUND",
      message: "[postService.getPostById] Post not found",
    });
  }

  const data = snap.data()!;
  const author = await getUserByUid(data.userId);

  return {
    id: snap.id,
    ...data,
    userName: author?.name ?? "Unknown",
    userAvatarUrl: author?.avatarUrl ?? null,
  } as Post;
};

export const getPosts = async (
  limit = 20,
  startAfterId?: string
): Promise<Post[]> => {
  let currentUserUid: string | null = null;
  try {
    const session = await getUserFromSession();
    currentUserUid = session.uid;
  } catch (error) {
    currentUserUid = null;
  }

  let postsQuery = adminDb
    .collection(POSTS_COLLECTION)
    .where("moderationStatus", "==", "approved")
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (startAfterId) {
    const startSnap = await adminDb.collection("posts").doc(startAfterId).get();
    if (startSnap.exists) {
      postsQuery = postsQuery.startAfter(startSnap);
    }
  }

  const postsSnap = await postsQuery.get();
  if (postsSnap.empty) {
    return [];
  }

  const postDocs = postsSnap.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as Post;
  });

  const authorIds = [...new Set(postDocs.map((post) => post.userId))];
  const authors = await getUsersByIds(authorIds);

  const visiblePostIds = postsSnap.docs.map((doc) => doc.id);

  let likedPostIds: string[] = [];

  if (currentUserUid && visiblePostIds.length > 0) {
    const likesQuery = await adminDb
      .collection(LIKES_COLLECTION)
      .where("userId", "==", currentUserUid)
      .where("parentId", "in", visiblePostIds)
      .get();

    likedPostIds = likesQuery.docs.map((doc) => doc.data().parentId);
  }

  const posts: Post[] = postDocs.map((doc) => {
    const author = authors[doc.userId];
    return {
      ...doc,
      userName: author?.name ?? "Unknown",
      userAvatarUrl: author?.avatarUrl ?? null,
      isLikedByMe: likedPostIds.includes(doc.id),
    };
  });

  return posts;
};
