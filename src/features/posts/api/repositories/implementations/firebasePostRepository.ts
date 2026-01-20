import { IPostRepository } from "../postRepository.interface";
import { Post, ReportDetails } from "@/features/posts/types/post.type";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { createAppError } from "@/lib/AppError";
import admin from "firebase-admin";

const REPORT_THRESHOLD = 3;

export class FirebasePostRepository implements IPostRepository {
  private collection = adminDb.collection("posts");

  async createPost(postDoc: any): Promise<void> {
    await this.collection.add(postDoc);
  }

  async updatePost(postId: string, data: Partial<Post>): Promise<void> {
    await this.collection.doc(postId).update(data);
  }

  async getPostById(postId: string): Promise<Post | null> {
    const snap = await this.collection.doc(postId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as Post;
  }

  async getPosts(limit = 20, startAfterId?: string): Promise<Post[]> {
    let postsQuery = this.collection
      .where("moderationStatus", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (startAfterId) {
      const startSnap = await this.collection.doc(startAfterId).get();
      if (startSnap.exists) {
        postsQuery = postsQuery.startAfter(startSnap);
      }
    }

    const postsSnap = await postsQuery.get();
    if (postsSnap.empty) return [];

    return postsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post);
  }

  async getPostsByUserId(
    userId: string,
    limit = 20,
    startAfterId?: string,
  ): Promise<Post[]> {
    let postsQuery = this.collection
      .where("userId", "==", userId)
      .where("moderationStatus", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (startAfterId) {
      const startSnap = await this.collection.doc(startAfterId).get();
      if (startSnap.exists) {
        postsQuery = postsQuery.startAfter(startSnap);
      }
    }

    const postsSnap = await postsQuery.get();
    if (postsSnap.empty) return [];

    return postsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Post);
  }

  async reportPost(
    postId: string,
    reportDetails: { userId: string; reason: string; details?: string },
  ): Promise<{ hidden: boolean; reportsCount: number }> {
    const postRef = this.collection.doc(postId);

    return await adminDb.runTransaction(async (t) => {
      const doc = await t.get(postRef);
      if (!doc.exists) {
        throw createAppError({
          code: "NOT_FOUND",
          message: "[postRepository.reportPost] Post document not found by ID",
        });
      }

      const data = doc.data()!;
      const reports = data.userReports || [];

      if (reports.includes(reportDetails.userId)) {
        throw createAppError({
          code: "CONFLICT",
          message:
            "[postRepository.reportPost] User has already reported this post",
        });
      }

      const newReports = [...reports, reportDetails.userId];
      const newReportMeta: ReportDetails = {
        uid: reportDetails.userId,
        reason: reportDetails.reason,
        details: reportDetails.details || "",
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
  }
}
