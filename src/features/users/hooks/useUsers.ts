import { useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { deleteUser as deleteAuthUser } from "firebase/auth";
import { useActionLogger } from "@/features/actions/useActions";
import type { User, UserDataUpdate } from "../types/user.type";

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { logAction } = useActionLogger(db);

  const getAllUsers = async (): Promise<User[]> => {
    setLoading(true);
    setError(null);

    try {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);

      const usersData = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          email: data.email,
          role: data.role,
          lastOnline: data.lastOnline,
          avatarUrl: data.avatarUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isActive: data.isActive,
        } as User;
      });

      return usersData;
    } catch (error) {
      // const errorMsg = "Error fetching users";
      // setError(errorMsg);
      // console.error(errorMsg, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (uid: string): Promise<User | null> => {
    setLoading(true);
    setError(null);

    try {
      const userDocRef = doc(db, "users", uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) return null;

      const userData = { id: docSnap.id, ...docSnap.data() } as User;
      return userData;
    } catch (error) {
      const errorMsg = "Error fetching user";
      setError(errorMsg);
      console.error(errorMsg, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentUser = async (
    data: Partial<UserDataUpdate>
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, data);

      try {
        const performedBy = auth.currentUser?.uid ?? null;
        let actionType = "user.update";
        let message = "User updated";

        if ("role" in data) {
          actionType = "user.permission.change";
          message = `User role changed to ${data.role}`;
        } else if ("password" in data) {
          actionType = "user.password.change";
          message = "User password changed";
        }

        await logAction({
          actionType,
          userId: user.uid,
          username: data.name ?? null,
          performedBy,
          status: "success",
          message,
          meta: {
            updatedFields: Object.keys(data),
          },
        });
      } catch (logErr) {
        console.warn("logAction failed (updateUser):", logErr);
      }
    } catch (error) {
      const errorMsg = "Error updating user";
      setError(errorMsg);
      console.error(errorMsg, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCurrentUser = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);
      const userData = userSnapshot.exists() ? userSnapshot.data() : null;

      await deleteDoc(userDocRef);

      await deleteAuthUser(user);

      try {
        await logAction({
          actionType: "user.delete",
          userId: user.uid,
          username: userData?.name ?? user.email ?? null,
          performedBy: user.uid,
          status: "success",
          message: "User deleted themself",
          meta: {
            deletedAt: new Date().toISOString(),
          },
        });
      } catch (logErr) {
        console.warn("logAction failed (deleteCurrentUser):", logErr);
      }
    } catch (error) {
      const errorMsg = "Error deleting current user";
      setError(errorMsg);
      console.error(errorMsg, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (
    field: keyof Omit<User, "uid">,
    value: string
  ): Promise<User[]> => {
    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, "users"), where(field, "==", value));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map((doc) => doc.data() as User);

      return usersData;
    } catch (error) {
      const errorMsg = "Error searching users";
      setError(errorMsg);
      console.error(errorMsg, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,

    getAllUsers,
    getUserById,
    updateCurrentUser,
    deleteCurrentUser,
    searchUsers,
    clearError,
  };
}
