import type {
  BlockUserPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRestrictionPayload,
  UserRepository,
} from "./user.repository.interface";
import { User } from "../../types/user.entity";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { mapDatesFromFirestore } from "@/features/shared/utils/firestoreMappers";

export class UserFirebaseRepository implements UserRepository {
  private get collection() {
    return adminDb.collection("users");
  }

  async createUser(data: CreateUserPayload): Promise<void> {
    const normalizedName = data.name.trim().toLowerCase();
    const userDoc = {
      uid: data.uid,
      name: data.name,
      nameLowercase: normalizedName,
      email: data.email,
      role: data.role,
      createdAt: FieldValue.serverTimestamp(),
    };

    await this.collection.doc(data.uid).set(userDoc, { merge: true });
  }

  async getUserByUid(uid: string): Promise<User | null> {
    const doc = await this.collection.doc(uid).get();
    if (!doc.exists) return null;
    return mapDatesFromFirestore(doc.data()) as User;
  }

  async getUserByName(name: string): Promise<User | null> {
    const snapshot = await this.collection
      .where("name", "==", name)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return mapDatesFromFirestore(snapshot.docs[0].data()) as User;
  }

  async getUsersByIds(
    uids: string[],
  ): Promise<Record<string, { name: string; avatarUrl?: string | null }>> {
    const uniqueUids = [...new Set(uids)];
    const usersMap: Record<
      string,
      { name: string; avatarUrl?: string | null }
    > = {};
    const uidChunks: string[][] = [];

    for (let i = 0; i < uniqueUids.length; i += 30) {
      uidChunks.push(uniqueUids.slice(i, i + 30));
    }

    const promises = uidChunks.map((chunk) =>
      this.collection.where("uid", "in", chunk).get(),
    );

    const snapshots = await Promise.all(promises);

    for (const snapshot of snapshots) {
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) => {
          const user = mapDatesFromFirestore(doc.data()) as User;
          if (user) {
            usersMap[user.uid] = {
              name: user.name,
              avatarUrl: user.avatarUrl || null,
            };
          }
        });
      }
    }
    return usersMap;
  }

  async blockUser(data: BlockUserPayload): Promise<void> {
    if (!data.uidToBlock) throw new Error("uidToBlock is required");

    await adminAuth.updateUser(data.uidToBlock, { disabled: true });

    await this.collection.doc(data.uidToBlock).update({
      isBanned: true,
      updatedAt: FieldValue.serverTimestamp(),
      bannedBy: data.bannedBy,
      bannedReason: data.bannedReason,
    });
  }

  async unblockUser(uid: string): Promise<void> {
    await adminAuth.updateUser(uid, { disabled: false });

    await this.collection.doc(uid).update({
      isBanned: false,
      updatedAt: FieldValue.serverTimestamp(),
      bannedBy: null,
      bannedReason: undefined,
    });
  }

  async updateUserRestriction({
    uid,
    isRestricted,
    restrictedBy,
    restrictedReason,
  }: UpdateUserRestrictionPayload): Promise<void> {
    const updateData: any = {
      isRestricted,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (isRestricted) {
      updateData.restrictedBy = restrictedBy;
      updateData.restrictedReason = restrictedReason;
    } else {
      updateData.restrictedBy = FieldValue.delete();
      updateData.restrictedReason = FieldValue.delete();
    }

    await this.collection.doc(uid).update(updateData);
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => {
      const mapped = mapDatesFromFirestore(doc.data());
      return { uid: doc.id, ...mapped } as User;
    });
  }

  async deleteUser(uid: string): Promise<void> {
    await this.collection.doc(uid).delete();
  }

  async updateUser(uid: string, data: UpdateUserPayload): Promise<void> {
    const updateData: any = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Jeśli aktualizujemy name, zaktualizuj też nameLowercase
    if (data.name !== undefined) {
      updateData.nameLowercase = data.name.trim().toLowerCase();
    }

    await this.collection.doc(uid).update(updateData);
  }
}
