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
} from "../types/post.type";
import { formatZodErrorFlat } from "@/lib/zod";

import {
  uploadImage,
  deleteImage,
  hasFile,
} from "@/features/images/api/imageService";
import { moderateText } from "@/features/moderation/api/textModeration";

const POSTS_COLLECTION = "posts";
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

export const reportPost = async (postId: string, reason: string) => {
  const user = await getUserFromSession();
  const postRef = adminDb.collection(POSTS_COLLECTION).doc(postId);

  return await adminDb.runTransaction(async (t) => {
    const doc = await t.get(postRef);
    if (!doc.exists) {
      throw createAppError({ code: "NOT_FOUND", message: "Post nie istnieje" });
    }

    const data = doc.data()!;
    const reports = data.userReports || [];

    if (reports.includes(user.uid)) {
      throw createAppError({
        code: "CONFLICT",
      });
    }

    const newReports = [...reports, user.uid];

    const shouldHide = newReports.length >= REPORT_THRESHOLD;

    const updateData: any = {
      userReports: newReports,
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
      message: "Invalid post data",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  let moderationStatus: "approved" | "pending" = "approved";
  let flaggedReasons: string[] = [];

  if (postData.text) {
    const aiResult = await moderateText(postData.text);

    if (aiResult.flagged) {
      moderationStatus = "pending";
      flaggedReasons = aiResult.categories;
    }
  }

  let imageUrl: string | null = null;
  let imageMeta: any = null;

  if (hasFile(postData.imageFile)) {
    const upload = await uploadImage(postData.imageFile, user.uid);
    const safePublicUrl = normalizePublicUrl(upload.publicUrl);
    imageUrl = safePublicUrl || null;

    imageMeta = {
      storagePath: upload.storagePath,
      downloadToken: upload.downloadToken,
    };
  }

  const doc = {
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
    flaggedReasons,
  };

  const ref = await adminDb.collection(POSTS_COLLECTION).add(doc);
  return { id: ref.id, ...doc } as Post;
};

export const updatePost = async (postId: string, data: UpdatePost) => {
  const user = await getUserFromSession();

  const parsed = UpdatePostSchema.safeParse(data);
  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Invalid post data",
      data: { details: formatZodErrorFlat(parsed.error) },
    });
  }

  const ref = adminDb.collection(POSTS_COLLECTION).doc(postId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw createAppError({
      code: "NOT_FOUND",
      message: "Post not found",
    });
  }

  const post = snap.data()!;

  if (post.userId !== user.uid) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "Not allowed",
    });
  }

  let imageUrl = post.imageUrl;
  let imageMeta = post.imageMeta;

  if (hasFile(data.imageFile)) {
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
      message: "Post not found",
    });
  }

  const snap = await adminDb.collection(POSTS_COLLECTION).doc(postId).get();
  if (!snap.exists) {
    throw createAppError({
      code: "NOT_FOUND",
      message: "Post not found",
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
  } catch (err) {
    currentUserUid = null;
  }

  let query = adminDb
    .collection("posts")
    .where("moderationStatus", "==", "approved")
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (startAfterId) {
    const startSnap = await adminDb.collection("posts").doc(startAfterId).get();
    if (startSnap.exists) {
      query = query.startAfter(startSnap);
    }
  }

  const snap = await query.get();

  const posts = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();

      let isLikedByMe = false;

      if (currentUserUid) {
        const likeSnap = await d.ref
          .collection("likes")
          .doc(currentUserUid)
          .get();
        isLikedByMe = likeSnap.exists;
      }

      return {
        id: d.id,
        userId: data.userId,
        userName: data.userName,
        userAvatarUrl: data.userAvatarUrl ?? null,
        text: data.text,
        imageUrl: data.imageUrl ?? null,
        device: data.device ?? null,

        likesCount: data.likesCount ?? 0,
        commentsCount: data.commentsCount ?? 0,

        isLikedByMe,

        likes: null,

        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
        moderationStatus: data.moderationStatus,
      } as Post;
    })
  );

  return posts;
};
