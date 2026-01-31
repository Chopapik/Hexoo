import admin from "firebase-admin";
import { PostRepository } from "./post.repository.interface";
import { ReportDetails } from "@/features/shared/types/report.type";
import { ModerationStatus } from "@/features/shared/types/content.type";
import { mapDatesFromFirestore } from "@/features/shared/utils/firestoreMappers";
import { CreatePostPayload, UpdatePostPayload } from "../../types/post.payload";
import { PostEntity } from "../../types/post.entity";

export class PostFirebaseRepository implements PostRepository {
  private get collection() {
    return admin.firestore().collection("posts");
  }

  async createPost(data: CreatePostPayload): Promise<void> {
    await this.collection.add(data);
  }

  async updatePost(postId: string, data: UpdatePostPayload): Promise<void> {
    await this.collection.doc(postId).update(data);
  }

  async getPostById(postId: string): Promise<PostEntity | null> {
    const doc = await this.collection.doc(postId).get();
    if (!doc.exists) return null;
    const mapped = mapDatesFromFirestore(doc.data());
    return { id: doc.id, ...mapped } as PostEntity;
  }

  //create public and private variables
  async getPosts(limit: number, startAfterId?: string): Promise<PostEntity[]> {
    let query = this.collection
      .where("moderationStatus", "==", ModerationStatus.Approved)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (startAfterId) {
      const lastDoc = await this.collection.doc(startAfterId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => {
      const mapped = mapDatesFromFirestore(doc.data());
      return { id: doc.id, ...mapped } as PostEntity;
    });
  }

  //create public and private variables
  async getPostsByUserId(
    userId: string,
    limit: number,
    startAfterId?: string,
  ): Promise<PostEntity[]> {
    let query = this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (startAfterId) {
      const lastDoc = await this.collection.doc(startAfterId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => {
      const mapped = mapDatesFromFirestore(doc.data());
      return { id: doc.id, ...mapped } as PostEntity;
    });
  }

  async reportPost(postId: string, reportDetails: ReportDetails) {
    const postRef = this.collection.doc(postId);
    const reportsRef = postRef.collection("reports");

    return await admin.firestore().runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) throw new Error("Post not found");

      transaction.set(reportsRef.doc(), {
        ...reportDetails,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      transaction.update(postRef, {
        reportsMeta: admin.firestore.FieldValue.arrayUnion(reportDetails),
        userReports: admin.firestore.FieldValue.arrayUnion(reportDetails.uid),
      });

      const reportsSnapshot = await reportsRef.count().get();
      const reportsCount = reportsSnapshot.data().count + 1;
      const shouldHide = reportsCount >= 3;

      if (shouldHide) {
        transaction.update(postRef, {
          moderationStatus: ModerationStatus.Pending,
        });
      }

      return { hidden: shouldHide, reportsCount };
    });
  }
  async deletePost(postId: string): Promise<void> {
    await this.collection.doc(postId).delete();
  }
}
