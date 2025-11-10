import { adminAuth } from "@/lib/firebaseAdmin";
import { RegisterData } from "../types/auth.types";
import { createUserDocument } from "@/features/users/api/userService";
import { handleRegistrationError } from "./processRegistrationError";

export async function createAuthUser(userData: {
  email: string;
  password: string;
  displayName: string;
}) {
  return adminAuth.createUser({
    email: userData.email,
    password: userData.password,
    displayName: userData.displayName,
  });
}

export async function registerUser(userRegisterData: RegisterData) {
  let uid: string | null = null;

  try {
    const user = await createAuthUser({
      email: userRegisterData.email,
      password: userRegisterData.password,
      displayName: userRegisterData.name,
    });

    uid = user.uid;

    await createUserDocument(uid, {
      name: userRegisterData.name,
      email: userRegisterData.email,
      role: "user",
    });

    const token = await adminAuth.createCustomToken(uid);
    return { ok: true, token };
  } catch (error) {
    await handleRegistrationError(error, uid);
  }
}
