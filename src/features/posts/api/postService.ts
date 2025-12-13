import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/ApiError";
import {
  CreatePostSchema,
  UpdatePostSchema,
  type CreatePost,
  type UpdatePost,
  type Post,
  ReportDetails,
} from "../types/post.type";
import { formatZodErrorFlat } from "@/lib/zod";

import {
  uploadImage,
  deleteImage,
  hasFile,
} from "@/features/images/api/imageService";
import { moderateText } from "@/features/moderation/api/textModeration";
import { FieldValue } from "firebase-admin/firestore";
import { moderateImage } from "@/features/moderation/api/imageModeration";
import {
  getAiModerationVerdict,
  ModerationStatus,
} from "../utils/assessPostSafety";

const POSTS_COLLECTION = "posts";
const LIKES_COLLECTION = "likes";

const REPORT_THRESHOLD = 3;

const normalizePublicUrl = (
  u: string | null | undefined
): string | null | undefined => {
  if (!u) return u;
  const protoMatch = u.match(/^(https?:\/\/)/i);
  if (!protoMatch) return u;
  const proto = protoMatch[1];
  const rest = u.slice(proto.length).replace(/^(https?:\/\/)+/i, "");
  return proto + rest;
};

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
      createdAt: new Date().toISOString(),
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

export const createPost = async (postData: CreatePost) => {
  const user = await getUserFromSession();

  const parsed = CreatePostSchema.safeParse(postData);

  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[postService.createPost] Invalid post data",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  let moderationStatus: ModerationStatus = "approved";
  let flaggedReasons: string[] = [];
  let isNSFW: boolean = false;
  let flaggedSource: string[] = [];

  //text ai moderation
  if (postData.text && postData.text.trim()) {
    const textResult = await moderateText(postData.text);
    if (textResult.flagged) {
      flaggedReasons.push(...textResult.categories);
      flaggedSource.push("text");
    }
  }

  //image ai moderation
  if (postData.imageFile && postData.imageFile instanceof File) {
    const imageResult = await moderateImage(postData.imageFile);

    if (imageResult.flagged) {
      const uniqueCategories = imageResult.categories.filter(
        (c) => !flaggedReasons.includes(c)
      );
      flaggedReasons.push(...uniqueCategories);
      flaggedSource.push("image");
    }
  }

  // moderation verdict
  if (flaggedReasons.length > 0) {
    const moderationResult = getAiModerationVerdict(flaggedReasons);

    isNSFW = moderationResult.isNSFW;
    moderationStatus = moderationResult.status;
  }

  if (moderationStatus === "rejected") {
    throw createAppError({
      code: "POLICY_VIOLATION",
      message: "[postService.createPost] Post content regard service terms",
      data: { reasons: flaggedReasons },
    });
  }

  let imageUrl: string | null = null;
  let imageMeta: {
    storagePath: string;
    downloadToken: string;
  } | null = null;

  // save file to store
  if (hasFile(postData.imageFile) && postData.imageFile) {
    const upload = await uploadImage(postData.imageFile, user.uid);
    const safePublicUrl = normalizePublicUrl(upload.publicUrl);
    imageUrl = safePublicUrl || null;

    imageMeta = {
      storagePath: upload.storagePath,
      downloadToken: upload.downloadToken,
    };
  }

  const Postdoc = {
    userId: user.uid,
    userName: user.name,
    userAvatarUrl: user.avatarUrl ?? null,
    text: postData.text,
    imageUrl,
    imageMeta,
    likesCount: 0,
    commentsCount: 0,
    device: postData.device ?? "Web",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    moderationStatus,
    isNSFW,
    flaggedReasons,
    flaggedSource,
  };

  const createdPostRef = await adminDb
    .collection(POSTS_COLLECTION)
    .add(Postdoc);

  // const likeDoc = {
  //   postId: createdPostRef.id,
  //   userId: user.uid,
  //   likedAt: admin.firestore.FieldValue.serverTimestamp(),
  // };

  // await adminDb.collection(LIKES_COLLECTION).add(likeDoc);
};

export const updatePost = async (postId: string, data: UpdatePost) => {
  const user = await getUserFromSession();

  const parsed = UpdatePostSchema.safeParse(data);
  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "[postService.updatePost] Invalid post data",
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

  let imageUrl = post.imageUrl;
  let imageMeta = post.imageMeta;

  if (hasFile(data.imageFile) && data.imageFile) {
    const upload = await uploadImage(data.imageFile, user.uid);

    const safePublicUrl = normalizePublicUrl(upload.publicUrl);
    imageUrl = safePublicUrl;
    imageMeta = {
      storagePath: upload.storagePath,
      downloadToken: upload.downloadToken,
    };

    await deleteImage(post.imageMeta?.storagePath);
  }

  await ref.update({
    text: data.text ?? post.text,
    imageUrl,
    imageMeta,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return await getPostById(postId);
};

export const getPostById = async (postId: string) => {
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
  return {
    id: snap.id,
    ...data,
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

  const posts = postsSnap.docs.map((doc) => {
    const data = doc.data();
    const postId = doc.id;

    return {
      id: postId,
      userId: data.userId,
      userName: data.userName,
      userAvatarUrl: data.userAvatarUrl ?? null,
      text: data.text,
      imageUrl: data.imageUrl ?? null,
      device: data.device ?? null,

      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,

      isLikedByMe: likedPostIds.includes(postId),

      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.createdAt,
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate()
        : data.updatedAt,
      moderationStatus: data.moderationStatus,
    } as Post;
  });

  return posts;
};
