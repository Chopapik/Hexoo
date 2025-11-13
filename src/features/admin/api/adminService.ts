import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
import maskEmail from "@/features/shared/utils/maskEmail";

export const getAllUsers = async () => {
  try {
    const session = await getUserFromSession();
    if (!session || session.role !== "admin") {
      console.error(
        "Bład podczas wkonywania admin:getAllUsers: User nie jest adminem"
      );

      throw new Error();
    }
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

export const updateUserData = async (
  uid: string,
  data: { name?: string; email?: string; role?: string }
) => {
  try {
    await adminDb.collection("users").doc(uid).update({
      name: data.name,
      role: data.role,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Bład podczas wkonywania admin:updateUserData: ", error);
    throw error;
  }
};

export const updateUserPassword = async (uid: string, newPassword: string) => {
  try {
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
    await adminAuth.updateUser(uid, { disabled: false });
    await adminDb.collection("users").doc(uid).update({
      isBanned: false,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};
