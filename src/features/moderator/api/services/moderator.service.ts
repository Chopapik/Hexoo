import { adminDb } from "@/lib/firebaseAdmin";
import { createAppError } from "@/lib/AppError";
import { FieldValue } from "firebase-admin/firestore";
import { blockUser, getUsersByIds } from "@/features/users/api/services";
import { deleteImage } from "@/features/images/api/imageService";
import { PostEntity } from "@/features/posts/types/post.entity";
import { ModerationPostDto } from "@/features/posts/types/post.dto";
import { UserRole } from "@/features/users/types/user.type";
import { ModerationStatus } from "@/features/shared/types/content.type";
import type { SessionData } from "@/features/me/me.type";
import type { ModeratorService as IModeratorService } from "./moderator.service.interface";

export class ModeratorService implements IModeratorService {
  constructor(private readonly session: SessionData | null) {}

  private ensureModeratorOrAdmin(): SessionData {
    const session = this.session;
    if (!session) {
      throw createAppError({
        code: "AUTH_REQUIRED",
        message: "[moderatorService.ensureModeratorOrAdmin] No session found",
      });
    }
    if (session.role !== UserRole.Moderator && session.role !== UserRole.Admin) {
      throw createAppError({
        code: "FORBIDDEN",
        message:
          "[moderatorService.ensureModeratorOrAdmin] Missing moderator/admin role",
      });
    }
    return session;
  }

  async getModerationQueue(): Promise<ModerationPostDto[]> {
    this.ensureModeratorOrAdmin();

    const postsRef = adminDb.collection("posts");

    const pendingSnapshot = await postsRef
      .where("moderationStatus", "==", ModerationStatus.Pending)
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
    })) as PostEntity[];

    const authorIds = [...new Set(postDocs.map((post) => post.userId))];

    const authors = await getUsersByIds(authorIds);

    const postsWithAuthors: ModerationPostDto[] = postDocs.map((post) => {
      const author = authors[post.userId];
      return {
        ...post,
        userName: author?.name ?? "Unknown",
        userAvatarUrl: author?.avatarUrl ?? null,
      };
    });

    return postsWithAuthors;
  }

  async reviewPost(
    postId: string,
    action: "approve" | "reject" | "quarantine",
    banAuthor: boolean = false,
  ) {
    const moderator = this.ensureModeratorOrAdmin();

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

        const postData = postDoc.data() as PostEntity;

        if (action === "reject") {
          transaction.delete(postRef);

          if (postData.imageMeta?.storagePath) {
            await deleteImage(postData.imageMeta.storagePath);
          }
          await deleteImage(postData.imageMeta?.storagePath);
        } else if (action === "approve") {
          transaction.update(postRef, {
            moderationStatus: ModerationStatus.Approved,
            flaggedReasons: [],
            reviewedBy: moderator.uid,
            reviewedAt: FieldValue.serverTimestamp(),
          });
        } else if (action === "quarantine") {
          transaction.update(postRef, {
            moderationStatus: ModerationStatus.Pending,
            reviewedBy: moderator.uid,
            reviewedAt: FieldValue.serverTimestamp(),
          });
        }

        return { authorId: postData?.userId };
      },
    );

    if (banAuthor && transactionResult.authorId) {
      try {
        await blockUser(moderator, {
          uidToBlock: transactionResult.authorId,
          bannedBy: moderator.uid,
          bannedReason: `Decision on post ${postId}`,
        });
      } catch (error) {
        console.error(
          `[ReviewPost] Failed to ban user ${transactionResult.authorId} after post review.`,
          error,
        );
      }
    }
  }
}
