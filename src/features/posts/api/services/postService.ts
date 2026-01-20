import admin from "firebase-admin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import { createAppError } from "@/lib/AppError";
import {
  CreatePostSchema,
  UpdatePostSchema,
  type CreatePost,
  type UpdatePost,
  type Post,
} from "@/features/posts/types/post.type";
import { formatZodErrorFlat } from "@/lib/zod";
import { deleteImage } from "@/features/images/api/imageService";
import {
  getUsersByIds,
  getUserByUid,
} from "@/features/users/api/services/userService";
import processPostContent from "./postHelpers";
import { postRepository } from "../repositories";
import { likeRepository } from "@/features/likes/api/repositories";

export const reportPost = async (
  postId: string,
  reason: string,
  details?: string,
) => {
  const user = await getUserFromSession();

  return await postRepository.reportPost(postId, {
    userId: user.uid,
    reason,
    details,
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
    createPostData.imageFile,
  );

  const postDoc = {
    userId: user.uid,
    text: createPostData.text,
    imageUrl: processed.imageUrl ?? null,
    imageMeta: processed.imageMeta ?? null,
    likesCount: 0,
    commentsCount: 0,
    device: createPostData.device ?? "Web",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    moderationStatus: processed.moderationStatus,
    isNSFW: processed.isNSFW,
    flaggedReasons: processed.flaggedReasons,
  };

  await postRepository.createPost(postDoc);
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

  const post = await postRepository.getPostById(postId);

  if (!post) {
    throw createAppError({
      code: "NOT_FOUND",
      message: "[postService.updatePost] Post not found",
    });
  }

  if (post.userId !== user.uid) {
    throw createAppError({
      code: "FORBIDDEN",
      message: "[postService.updatePost] User is not the author of the post",
    });
  }

  const processed = await processPostContent(
    user.uid,
    updateData.text ?? post.text,
    updateData.imageFile,
  );

  if (processed.imageUrl && post.imageMeta?.storagePath) {
    await deleteImage(post.imageMeta.storagePath);
  }

  await postRepository.updatePost(postId, {
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

  const post = await postRepository.getPostById(postId);

  if (!post) {
    throw createAppError({
      code: "NOT_FOUND",
      message: "[postService.getPostById] Post not found",
    });
  }

  const author = await getUserByUid(post.userId);

  return {
    ...post,
    userName: author?.name ?? "Unknown",
    userAvatarUrl: author?.avatarUrl ?? null,
  } as Post;
};

export const getPosts = async (
  limit = 20,
  startAfterId?: string,
): Promise<Post[]> => {
  let currentUserUid: string | null = null;
  try {
    const session = await getUserFromSession();
    currentUserUid = session.uid;
  } catch (error) {
    currentUserUid = null;
  }

  const posts = await postRepository.getPosts(limit, startAfterId);

  if (posts.length === 0) {
    return [];
  }

  const authorIds = [...new Set(posts.map((post) => post.userId))];
  const authors = await getUsersByIds(authorIds);

  const visiblePostIds = posts.map((post) => post.id);

  let likedPostIds: string[] = [];

  if (currentUserUid && visiblePostIds.length > 0) {
    likedPostIds = await likeRepository.getLikesForParents(
      currentUserUid,
      visiblePostIds,
    );
  }

  return posts.map((post) => {
    const author = authors[post.userId];
    return {
      ...post,
      userName: author?.name ?? "Unknown",
      userAvatarUrl: author?.avatarUrl ?? null,
      isLikedByMe: likedPostIds.includes(post.id),
      id: post.id, // Ensure ID is present
    };
  });
};

export const getPostsByUserId = async (
  userId: string,
  limit = 20,
  startAfterId?: string,
): Promise<Post[]> => {
  let currentUserUid: string | null = null;
  try {
    const session = await getUserFromSession();
    currentUserUid = session.uid;
  } catch {
    currentUserUid = null;
  }

  const posts = await postRepository.getPostsByUserId(
    userId,
    limit,
    startAfterId,
  );

  if (posts.length === 0) return [];

  const author = await getUserByUid(userId);
  const visiblePostIds = posts.map((post) => post.id);

  let likedPostIds: string[] = [];
  if (currentUserUid && visiblePostIds.length > 0) {
    likedPostIds = await likeRepository.getLikesForParents(
      currentUserUid,
      visiblePostIds,
    );
  }

  return posts.map((post) => ({
    ...post,
    userName: author?.name ?? "Unknown",
    userAvatarUrl: author?.avatarUrl ?? null,
    isLikedByMe: likedPostIds.includes(post.id),
    id: post.id,
  }));
};
