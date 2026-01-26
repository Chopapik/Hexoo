import { ActivityRepository } from "../activityRepository.interface";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export class FirebaseActivityRepository implements ActivityRepository {
  private collection = adminDb.collection("activity_logs");

  async logActivity(logData: any): Promise<void> {
    await this.collection.add({
      ...logData,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}
