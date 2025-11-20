import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/ApiError";
import {
  type Post,
  type CreatePost,
  type UpdatePost,
  CreatePostSchema,
  UpdatePostSchema,
} from "../types/post.type";
import { formatZodErrorFlat } from "@/lib/zod";

const POSTS_COLLECTION = "posts";

/**
 * Image upload is disabled for now.
 * This function will be implemented later.
 */
/*
async function uploadImage(file: any): Promise<string> {
  if (!file) return null as any;

  throw createAppError({
    code: "SERVICE_UNAVAILABLE",
    message: "uploadImage is not implemented yet",
  });
}
*/

export async function createPost(createPostData: CreatePost) {
  const user = await getUserFromSession();

  const parsed = CreatePostSchema.safeParse(createPostData);

  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Invalid post data",
      data: {
        code: "post/validation_failed",
        details: formatZodErrorFlat(parsed.error),
      },
    });
  }

  // Image upload disabled – text only
  /*
  let imageUrl: string | null = null;

  if (createPostData.imageFile) {
    imageUrl = await uploadImage(createPostData.imageFile);
  }
  */

  const doc = {
    userId: user.uid,
    userName: user.name,
    userAvatarUrl: user.avatarUrl ?? null,
    text: createPostData.text,
    // imageUrl: imageUrl ?? null, // disabled
    device: createPostData.device ?? "Web",
    likesCount: 0,
    commentsCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await adminDb.collection(POSTS_COLLECTION).add(doc);
  const snap = await ref.get();
  const data = snap.data() as any;

  return {
    id: ref.id,
    ...doc,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  } as Post;
}

export async function getPosts(
  limit = 20,
  startAfterId?: string
): Promise<Post[]> {
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
      query = query.startAfter(startSnap);
    }
  }

  const snap = await query.get();
  return snap.docs.map((d) => {
    const data: any = d.data();
    return {
      id: d.id,
      userId: data.userId,
      userName: data.userName,
      userAvatarUrl: data.userAvatarUrl ?? null,
      text: data.text,
      // imageUrl: data.imageUrl ?? null, // disabled
      device: data.device ?? null,
      likesCount: data.likesCount ?? 0,
      commentsCount: data.commentsCount ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt ?? null,
    } as Post;
  });
}

export async function getPostById(postId: string): Promise<Post> {
  if (!postId || typeof postId !== "string" || !postId.trim()) {
    throw createAppError({ code: "NOT_FOUND", message: "Post not found" });
  }

  console.log(
    "[postService] getPostById -> postId:",
    JSON.stringify(postId),
    "len:",
    postId.length
  );

  const docRef = adminDb.collection(POSTS_COLLECTION).doc(postId);
  const doc = await docRef.get();

  console.log(
    "[postService] getPostById doc.exists:",
    doc.exists,
    "docId:",
    doc.id
  );

  if (!doc.exists) {
    throw createAppError({ code: "NOT_FOUND", message: "Post not found" });
  }

  const data: any = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    userName: data.userName,
    userAvatarUrl: data.userAvatarUrl ?? null,
    text: data.text,
    // imageUrl: data.imageUrl ?? null, // disabled
    device: data.device ?? null,
    likesCount: data.likesCount ?? 0,
    commentsCount: data.commentsCount ?? 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt ?? null,
  } as Post;
}

export async function updatePost(postId: string, updateData: UpdatePost) {
  const user = await getUserFromSession();

  const parsed = UpdatePostSchema.safeParse(updateData);
  if (!parsed.success) {
    throw createAppError({
      code: "VALIDATION_ERROR",
      message: "Invalid post data",
      data: {
        code: "post/validation_failed",
        details: formatZodErrorFlat(parsed.error),
      },
    });
  }

  const postRef = adminDb.collection(POSTS_COLLECTION).doc(postId);
  const postDoc = await postRef.get();

  if (!postDoc.exists) {
    throw createAppError({ code: "NOT_FOUND", message: "Post not found" });
  }

  const postData = postDoc.data();

  if (!postData) {
    throw createAppError({
      message: "Post document is empty",
      code: "NOT_FOUND",
    });
  }

  if (postData.userId !== user.uid) {
    throw createAppError({ code: "FORBIDDEN" });
  }

  // Image upload disabled – text update only
  /*
  let imageUrl = postData.imageUrl;

  if (updateData.imageFile) {
    imageUrl = await uploadImage(updateData.imageFile);
  }
  */

  const updateDoc = {
    text: updateData.text !== undefined ? updateData.text : postData.text,
    // imageUrl: imageUrl, // disabled
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await postRef.update(updateDoc);

  return await getPostById(postId);
}
