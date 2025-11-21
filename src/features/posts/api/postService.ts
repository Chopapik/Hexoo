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
const POSTS_COLLECTION = "posts";

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

  let imageUrl: string | null = null;
  let imageMeta: any = null;

  if (hasFile(postData.imageFile)) {
    const upload = await uploadImage(postData.imageFile, user.uid);
    imageUrl = upload.publicUrl;
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
    imageUrl = upload.publicUrl;
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
  let query: FirebaseFirestore.Query = adminDb
    .collection(POSTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit);

  if (startAfterId) {
    const startSnap = await adminDb
      .collection(POSTS_COLLECTION)
      .doc(startAfterId)
      .get();
    if (startSnap.exists) {
      query = (query as any).startAfter(startSnap);
    }
  }

  const snap = await query.get();
  return snap.docs.map((d) => {
    const data: any = d.data();
    const createdAt = data?.createdAt?.toDate
      ? data.createdAt.toDate()
      : data.createdAt ?? null;
    const updatedAt = data?.updatedAt?.toDate
      ? data.updatedAt.toDate()
      : data.updatedAt ?? null;

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
      createdAt,
      updatedAt,
    } as Post;
  });
};
