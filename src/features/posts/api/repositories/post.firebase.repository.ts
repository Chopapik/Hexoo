import admin from "firebase-admin";
import {
  PostRepository,
  CreatePostDBInput,
  UpdatePostDBInput,
} from "./post.repository.interface";
import { Post } from "../../types/post.entity";
import { ReportDetails } from "../../types/post.type";

export class PostFirebaseRepository implements PostRepository {
  private get collection() {
    return admin.firestore().collection("posts");
  }

  async createPost(data: CreatePostDBInput): Promise<void> {
    await this.collection.add(data);
  }

  async updatePost(postId: string, data: UpdatePostDBInput): Promise<void> {
    await this.collection.doc(postId).update(data);
  }

  async getPostById(postId: string): Promise<Post | null> {
    const doc = await this.collection.doc(postId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Post;
  }

  async getPosts(limit: number, startAfterId?: string): Promise<Post[]> {
    let query = this.collection.orderBy("createdAt", "desc").limit(limit);

    if (startAfterId) {
      const lastDoc = await this.collection.doc(startAfterId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
  }

  async getPostsByUserId(
    userId: string,
    limit: number,
    startAfterId?: string,
  ): Promise<Post[]> {
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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
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
      const hidden = reportsCount >= 5;

      if (hidden) {
        transaction.update(postRef, { isHidden: true });
      }

      return { hidden, reportsCount };
    });
  }
}
