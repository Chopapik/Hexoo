import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import maskEmail from "@/features/shared/utils/maskEmail";
import { AdminUserCreate } from "../types/admin.type";

const checkIsAdmin = async () => {
  const session = await getUserFromSession();
  if (!session || session.role !== "admin") {
    console.error(
      "Błąd podczas wykonywania admin:createUser: User nie jest adminem"
    );
    throw new Error();
  }
};

export const createUser = async (data: AdminUserCreate) => {
  try {
    await checkIsAdmin();

    const userRecord = await adminAuth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
    });

    const uid = userRecord.uid;

    await adminDb
      .collection("users")
      .doc(uid)
      .set({
        uid,
        email: data.email,
        maskedEmail: maskEmail(data.email),
        name: data.name,
        role: data.role || "user",
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return {
      uid,
      email: maskEmail(data.email),
      displayName: data.name,
      role: data.role,
    };
  } catch (error) {
    console.error("Błąd w admin:createUser:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    await checkIsAdmin();
    const snapshot = await adminDb.collection("users").get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        uid: doc.id,
        name: data.name,
        email: maskEmail(data?.email),
        role: data.role,
        createdAt: data.createdAt?.toDate(),
        isBanned: data.isBanned,
      };
    });

    return users;
  } catch (error) {
    console.error("Bład podczas wkonywania admin:getAllUsers: ", error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: { name?: string; email?: string; role?: string }
) => {
  try {
    await checkIsAdmin();
    await adminDb.collection("users").doc(uid).update({
      name: data.name,
      role: data.role,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Bład podczas wkonywania admin:updateUserProfile: ", error);
    throw error;
  }
};

export const updateUserPassword = async (uid: string, newPassword: string) => {
  try {
    await checkIsAdmin();
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });
  } catch (error) {
    console.error("Bład podczas wkonywania admin:updateUserPassword: ", error);
    throw error;
  }
};

export const blockUser = async (uid: string) => {
  try {
    await adminAuth.updateUser(uid, { disabled: true });
    await adminDb.collection("users").doc(uid).update({
      isBanned: true,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

export const unblockUser = async (uid: string) => {
  try {
    await checkIsAdmin();
    await adminAuth.updateUser(uid, { disabled: false });
    await adminDb.collection("users").doc(uid).update({
      isBanned: false,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};
