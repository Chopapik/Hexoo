# Podsumowanie Zmian w Git (Ponownie)

Wygląda na to, że poprzednie zatwierdzenie zmian (commit) nie powiodło się lub zostało cofnięte. Poniżej znajduje się ponowne podsumowanie aktualnych, niezatwierdzonych zmian w repozytorium.

## Status Zmian (`git status`)

```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/app/(core)/(user)/[name]/page.tsx
        modified:   src/app/(core)/layout.tsx
        modified:   src/app/admin/layout.tsx
        modified:   src/app/api/auth/login/route.ts
        modified:   src/app/api/auth/register/route.ts
        modified:   src/app/api/me/password/route.ts
        modified:   src/app/api/posts/route.ts
        modified:   src/app/moderator/layout.tsx
        modified:   src/features/admin/api/adminService.ts
        modified:   src/features/auth/api/authService.ts
        deleted:    src/features/auth/api/errors/processRegistrationError.ts
        modified:   src/features/auth/api/utils/verifySession.ts
        modified:   src/features/auth/hooks/useLogin.ts
        modified:   src/features/auth/hooks/useLogout.ts
        modified:   src/features/auth/hooks/useRegister.ts
        modified:   src/features/auth/hooks/useRegisterForm.ts
        modified:   src/features/auth/types/auth.type.ts
        modified:   src/features/auth/utils/loginFormValidation.ts
        modified:   src/features/auth/utils/registerFormValidation.ts
        modified:   src/features/comments/api/commentService.ts
        modified:   src/features/comments/hooks/useAddComment.ts
        modified:   src/features/images/api/imageService.ts
        modified:   src/features/likes/api/likeService.ts
        modified:   src/features/me/api/meService.ts
        modified:   src/features/me/hooks/useUpdatePassword.ts
        modified:   src/features/me/hooks/useUpdateProfile.ts
        modified:   src/features/moderation/api/imageModeration.ts
        modified:   src/features/moderation/api/textModeration.ts
        modified:   src/features/moderation/utils/assessSafety.ts
        modified:   src/features/moderator/api/moderatorService.ts
        modified:   src/features/posts/api/postService.ts
        modified:   src/features/posts/hooks/useCreatePost.ts
        modified:   src/features/posts/hooks/useReportPost.ts
        modified:   src/features/posts/utils/postFormValidation.ts
        modified:   src/features/users/api/userService.ts
        modified:   src/i18n/errorTranslator.ts
        deleted:    src/lib/ApiError.ts
        modified:   src/lib/axiosInstance.ts
        modified:   src/lib/http/routeWrapper.ts
        modified:   src/lib/recaptcha.ts
        modified:   src/lib/security/rateLimitService.ts
        modified:   src/lib/security/throttleService.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/app/global-error.tsx
        src/lib/AppError.ts

no changes added to commit (use "git add" and/or "git commit -a")
```

## Szczegółowe Zmiany (`git diff`)

```diff
diff --git a/src/app/(core)/(user)/[name]/page.tsx b/src/app/(core)/(user)/[name]/page.tsx
index 60d78d7..00a14eb 100644
--- a/src/app/(core)/(user)/[name]/page.tsx
+++ b/src/app/(core)/(user)/[name]/page.tsx
@@ -1,6 +1,6 @@
 import { UserProfileCard } from "@/features/users/components/UserProfileCard";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 
 export default async function ProfilePage({
   params,
diff --git a/src/app/(core)/layout.tsx b/src/app/(core)/layout.tsx
index faf217e..dced2e3 100644
--- a/src/app/(core)/layout.tsx
+++ b/src/app/(core)/layout.tsx
@@ -2,7 +2,7 @@ import type { Metadata } from "next";
 import { cookies } from "next/headers";
 import { Layout } from "@/features/shared/components/layout/Layout";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 
 export const metadata: Metadata = {
   title: "Hexoo",
@@ -15,16 +15,22 @@ export default async function RootLayout({
 }) {
   let sessionUserData = null;
 
-  try {
-    sessionUserData = await getUserFromSession();
-  } catch (error: unknown) {
-    if (
-      error instanceof ApiError &&
-      (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
-    ) {
-      sessionUserData = null;
-    } else {
-      throw error;
+  const cookieStore = await cookies();
+
+  const hasSessionCookie = cookieStore.has("session");
+
+  if (hasSessionCookie) {
+    try {
+      sessionUserData = await getUserFromSession();
+    } catch (error: unknown) {
+      if (
+        error instanceof ApiError &&
+        (error.code === "AUTH_REQUIRED" || error.code === "INVALID_SESSION")
+      ) {
+        sessionUserData = null;
+      } else {
+        throw error;
+      }
     }
   }
 
diff --git a/src/app/admin/layout.tsx b/src/app/admin/layout.tsx
index 875b4c6..23bd3c7 100644
--- a/src/app/admin/layout.tsx
+++ b/src/app/admin/layout.tsx
@@ -1,7 +1,7 @@
 import type { Metadata } from "next";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
-import { ApiError } from "@/lib/ApiError";
 import { notFound, redirect } from "next/navigation";
+import { ApiError } from "@/lib/AppError";
 
 export const metadata: Metadata = {
   title: "Hexoo",
diff --git a/src/app/api/auth/login/route.ts b/src/app/api/auth/login/route.ts
index eae5bb2..561246d 100644
--- a/src/app/api/auth/login/route.ts
+++ b/src/app/api/auth/login/route.ts
@@ -1,7 +1,7 @@
 import { createSession } from "@/features/auth/api/authService";
 import { withErrorHandling } from "@/lib/http/routeWrapper";
 import { handleSuccess } from "@/lib/http/responseHelpers";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { verifyRecaptchaToken } from "@/lib/recaptcha";
 import { NextRequest } from "next/server";
 
diff --git a/src/app/api/auth/register/route.ts b/src/app/api/auth/register/route.ts
index 84a24cb..12f4129 100644
--- a/src/app/api/auth/register/route.ts
+++ b/src/app/api/auth/register/route.ts
@@ -1,7 +1,7 @@
 import { registerUser } from "@/features/auth/api/authService";
 import { withErrorHandling } from "@/lib/http/routeWrapper";
 import { handleSuccess } from "@/lib/http/responseHelpers";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { verifyRecaptchaToken } from "@/lib/recaptcha";
 
 export const POST = withErrorHandling(async (req) => {
diff --git a/src/app/api/me/password/route.ts b/src/app/api/me/password/route.ts
index 2116398..b43355c 100644
--- a/src/app/api/me/password/route.ts
+++ b/src/app/api/me/password/route.ts
@@ -2,7 +2,7 @@ import { updatePassword } from "@/features/me/api/meService";
 import { withErrorHandling } from "@/lib/http/routeWrapper";
 import { handleSuccess } from "@/lib/http/responseHelpers";
 import { verifyRecaptchaToken } from "@/lib/recaptcha";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { NextRequest } from "next/server";
 
 export const PUT = withErrorHandling(async (req: NextRequest) => {
diff --git a/src/app/api/posts/route.ts b/src/app/api/posts/route.ts
index 39723df..f760f26 100644
--- a/src/app/api/posts/route.ts
+++ b/src/app/api/posts/route.ts
@@ -2,6 +2,7 @@ import { withErrorHandling } from "@/lib/http/routeWrapper";
 import { handleSuccess } from "@/lib/http/responseHelpers";
 import { createPost, getPosts } from "@/features/posts/api/postService";
 import { NextRequest } from "next/server";
+import { CreatePost } from "@/features/posts/types/post.type";
 export const POST = withErrorHandling(async (req: NextRequest) => {
   const contentType = req.headers.get("content-type") || "";
   if (contentType.includes("multipart/form-data")) {
@@ -13,7 +14,7 @@ export const POST = withErrorHandling(async (req: NextRequest) => {
       text,
       device,
       imageFile,
-    } as any);
+    } as CreatePost);
     return handleSuccess(result, 201);
   }
   const body = await req.json();
diff --git a/src/app/moderator/layout.tsx b/src/app/moderator/layout.tsx
index 70660cf..c2a6e2a 100644
--- a/src/app/moderator/layout.tsx
+++ b/src/app/moderator/layout.tsx
@@ -1,6 +1,6 @@
 import type { Metadata } from "next";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 import { notFound } from "next/navigation";
 
 export const metadata: Metadata = {
diff --git a/src/features/admin/api/adminService.ts b/src/features/admin/api/adminService.ts
index 165ba07..fca1bc6 100644
--- a/src/features/admin/api/adminService.ts
+++ b/src/features/admin/api/adminService.ts
@@ -2,7 +2,7 @@ import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
 import maskEmail from "@/features/shared/utils/maskEmail";
 import { AdminUserCreate } from "../types/admin.type";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import admin from "firebase-admin";
 
 const ensureAdmin = async () => {
@@ -46,7 +46,8 @@ export const adminCreateUserAccount = async (data: AdminUserCreate) => {
   if (!data?.email || !data?.password || !data?.name) {
     throw createAppError({
       code: "VALIDATION_ERROR",
-      message: "[adminService.adminCreateUserAccount] Empty create user credentials",
+      message:
+        "[adminService.adminCreateUserAccount] Empty create user credentials",
       data: { code: "admin/empty_create_user_account_credentials" },
     });
   }
@@ -154,7 +155,8 @@ export const adminUpdateUserPassword = async (
   if (!uid || !newPassword || newPassword.length < 8) {
     throw createAppError({
       code: "VALIDATION_ERROR",
-      message: "[adminService.adminUpdateUserPassword] Invalid password provided",
+      message:
+        "[adminService.adminUpdateUserPassword] Invalid password provided",
       data: { code: "admin/empty_create_user_account_credentials" },
     });
   }
diff --git a/src/features/auth/api/authService.ts b/src/features/auth/api/authService.ts
index 7a5956e..2d9d495 100644
--- a/src/features/auth/api/authService.ts
+++ b/src/features/auth/api/authService.ts
@@ -1,5 +1,5 @@
 import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import admin from "firebase-admin";
 import { setSessionCookie, clearSessionCookie } from "@/lib/session";
 import { isUsernameTaken } from "./utils/checkUsernameUnique";
diff --git a/src/features/auth/api/errors/processRegistrationError.ts b/src/features/auth/api/errors/processRegistrationError.ts
deleted file mode 100644
index 751fb89..0000000
--- a/src/features/auth/api/errors/processRegistrationError.ts
+++ /dev/null
@@ -1,48 +0,0 @@
-import { adminAuth } from "@/lib/firebaseAdmin";
-import { FirebaseAuthError } from "firebase-admin/auth";
-import { createAppError } from "@/lib/ApiError";
-import { FirebaseError } from "firebase/app";
-
-export async function processRegistrationError(
-  error: any,
-  uid?: string
-): Promise<never> {
-  if (uid) {
-    try {
-      await adminAuth.deleteUser(uid);
-      console.warn(`Rollback: użytkownik ${uid} został usunięty po błędzie.`);
-    } catch (rollbackError) {
-      if (rollbackError instanceof FirebaseError) {
-        throw createAppError({
-          code: "INTERNAL_ERROR",
-          message: `[processRegistrationError] Failed to rollback user deletion: ${rollbackError.message}`,
-        });
-      }
-    }
-  }
-
-  if (error instanceof FirebaseAuthError) {
-    if (
-      error.code === "auth/email-already-exists" ||
-      /already in use/i.test(error.message)
-    ) {
-      throw createAppError({
-        code: "CONFLICT",
-        message: "[processRegistrationError] Email already exists.",
-        data: {
-          code: error.code,
-          field: "email",
-        },
-      });
-    }
-
-    throw createAppError({
-      code: "VALIDATION_ERROR",
-      message: `[processRegistrationError] Firebase auth error: ${error.message}`,
-      data: {},
-      details: { stack: error.stack },
-    });
-  }
-
-  throw error;
-}
diff --git a/src/features/auth/api/utils/verifySession.ts b/src/features/auth/api/utils/verifySession.ts
index b60836d..28fadd8 100644
--- a/src/features/auth/api/utils/verifySession.ts
+++ b/src/features/auth/api/utils/verifySession.ts
@@ -1,5 +1,5 @@
 import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { getSessionCookie } from "@/lib/session";
 import { SessionData } from "@/features/me/me.type";
 
diff --git a/src/features/auth/hooks/useLogin.ts b/src/features/auth/hooks/useLogin.ts
index 5160104..430194b 100644
--- a/src/features/auth/hooks/useLogin.ts
+++ b/src/features/auth/hooks/useLogin.ts
@@ -3,11 +3,12 @@ import { useMutation } from "@tanstack/react-query";
 import { useRouter } from "next/navigation";
 import { LoginData } from "../types/auth.type";
 import axiosInstance from "@/lib/axiosInstance";
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 import { signInWithEmailAndPassword } from "firebase/auth";
 import { auth } from "@/lib/firebase";
 import { FirebaseError } from "firebase/app";
 import useRecaptcha from "@/features/shared/hooks/useRecaptcha";
+import toast from "react-hot-toast";
 
 type ErrorCallback = (errorCode: string, field?: string) => void;
 
@@ -41,7 +42,7 @@ export default function useLogin(onError: ErrorCallback) {
       const idToken = await userCredential.user.getIdToken();
 
       recaptchaToken && sessionMutation.mutate({ idToken, recaptchaToken });
-    } catch (error: any) {
+    } catch (error: unknown) {
       if (error instanceof FirebaseError) {
         const errorCode = error.code;
 
@@ -55,9 +56,10 @@ export default function useLogin(onError: ErrorCallback) {
           onError("RATE_LIMIT", "root");
         } else if (errorCode === "auth/user-disabled") {
           onError("FORBIDDEN", "root");
-        } else {
-          onError("default", "root");
         }
+      } else {
+        console.error(error);
+        toast.error("Wystąpił nieznany błąd.");
       }
     }
   };
diff --git a/src/features/auth/hooks/useLogout.ts b/src/features/auth/hooks/useLogout.ts
index 957c610..f815801 100644
--- a/src/features/auth/hooks/useLogout.ts
+++ b/src/features/auth/hooks/useLogout.ts
@@ -1,6 +1,7 @@
 import { useMutation } from "@tanstack/react-query";
 import axiosInstance from "@/lib/axiosInstance";
 import { useRouter } from "next/navigation";
+import toast from "react-hot-toast";
 
 export function useLogout() {
   const router = useRouter();
@@ -15,6 +16,7 @@ export function useLogout() {
     },
     onError: (error) => {
       console.error("Logout failed", error);
+      toast.error("Wystąpił nieznany bład");
     },
   });
 
diff --git a/src/features/auth/hooks/useRegister.ts b/src/features/auth/hooks/useRegister.ts
index a0f6035..e6f3b47 100644
--- a/src/features/auth/hooks/useRegister.ts
+++ b/src/features/auth/hooks/useRegister.ts
@@ -1,13 +1,15 @@
 import { useMutation } from "@tanstack/react-query";
 import { useRouter } from "next/navigation";
-import { RegisterData } from "../types/auth.type";
+import { RegisterData, registerFields } from "../types/auth.type";
 import axiosInstance from "@/lib/axiosInstance";
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
 import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
 import { auth } from "@/lib/firebase";
+import toast from "react-hot-toast";
+import { FirebaseError } from "firebase/app";
 
-type ErrorCallback = (errorCode: string, field?: string) => void;
+type ErrorCallback = (errorCode: string, field: registerFields) => void;
 
 export default function useRegister(onError: ErrorCallback) {
   const router = useRouter();
@@ -24,21 +26,11 @@ export default function useRegister(onError: ErrorCallback) {
     onSuccess: () => {
       router.push("/");
     },
-
-    onError: (error: ApiError) => {
-      if (!error) return;
-
-      if (error.code === "CONFLICT" && error.data?.field) {
-        onError(error.data.code || "username_taken", error.data.field);
-        return;
-      }
-      onError(error.message || "default");
-    },
   });
 
   const handleRegister = async (data: RegisterData) => {
     if (!executeRecaptcha) {
-      onError("reCAPTCHA nie jest jeszcze gotowa.", "root");
+      toast.error("reCAPTCHA nie jest jeszcze gotowa.");
       return;
     }
 
@@ -53,26 +45,35 @@ export default function useRegister(onError: ErrorCallback) {
       const idToken = await userCredential.user.getIdToken();
       const recaptchaToken = await executeRecaptcha("register");
 
-      sessionMutation.mutate({
+      await sessionMutation.mutateAsync({
         idToken,
         name: data.name,
         email: data.email,
         recaptchaToken,
       });
-    } catch (error: any) {
-      console.error("Client register error:", error);
-      const errorCode = error.code;
+    } catch (error: unknown) {
+      if (error instanceof FirebaseError) {
+        const errorCode = error.code;
+
+        if (errorCode === "auth/email-already-in-use") {
+          onError("auth/email-already-exists", "email");
+        } else if (errorCode === "auth/weak-password") {
+          onError("password_too_short", "password");
+        }
+      } else if (error instanceof ApiError) {
+        const errorCode = error.code;
 
-      if (errorCode === "auth/email-already-in-use") {
-        onError("auth/email-already-exists", "email");
-      } else if (errorCode === "auth/weak-password") {
-        onError("password_too_short", "password");
+        if (errorCode === "CONFLICT") {
+          onError(errorCode, "name");
+          return;
+        }
       } else {
-        onError("default", "root");
+        console.error("API Error during session creation:", error);
+        toast.error("Wystąpił nieznany bład");
+        return;
       }
     }
   };
-
   return {
     handleRegister,
     isLoading: sessionMutation.isPending,
diff --git a/src/features/auth/hooks/useRegisterForm.ts b/src/features/auth/hooks/useRegisterForm.ts
index 0c4c84e..07f7393 100644
--- a/src/features/auth/hooks/useRegisterForm.ts
+++ b/src/features/auth/hooks/useRegisterForm.ts
@@ -1,6 +1,10 @@
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
-import { RegisterData, RegisterSchema } from "../types/auth.type";
+import {
+  RegisterData,
+  registerFields,
+  RegisterSchema,
+} from "../types/auth.type";
 
 export function useRegisterForm() {
   const {
@@ -19,18 +23,12 @@ export function useRegisterForm() {
     },
   });
 
-  const handleServerErrors = (errorCode: string, field?: string) => {
-    if (field === "email" || field === "password" || field === "name") {
-      setError(field, {
-        type: "server",
-        message: errorCode,
-      });
-    } else {
-      setError("root", {
-        type: "server",
-        message: errorCode,
-      });
-    }
+  const handleServerErrors = (errorCode: string, field: registerFields) => {
+    console.log(errorCode, field);
+    setError(field, {
+      type: "server",
+      message: errorCode,
+    });
   };
 
   return {
diff --git a/src/features/auth/types/auth.type.ts b/src/features/auth/types/auth.type.ts
index 62d8a71..e68a84f 100644
--- a/src/features/auth/types/auth.type.ts
+++ b/src/features/auth/types/auth.type.ts
@@ -1,5 +1,6 @@
 import { z } from "zod";
-import { UserRole } from "@/features/users/types/user.type";
+
+export type registerFields = "name" | "email" | "password";
 
 export const RegisterSchema = z.object({
   email: z
diff --git a/src/features/auth/utils/loginFormValidation.ts b/src/features/auth/utils/loginFormValidation.ts
index d5de57e..bf038cb 100644
--- a/src/features/auth/utils/loginFormValidation.ts
+++ b/src/features/auth/utils/loginFormValidation.ts
@@ -1,5 +1,4 @@
 import { ValidationMessage } from "@/features/shared/types/validation.type";
-import { INVALID } from "zod/v3";
 
 const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
   email_required: {
@@ -27,11 +26,6 @@ const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
     field: "root",
     type: "Dismiss",
   },
-  default: {
-    text: "Wystąpił nieznany błąd",
-    field: "root",
-    type: "Dismiss",
-  },
 };
 
 export function parseErrorMessages(
diff --git a/src/features/auth/utils/registerFormValidation.ts b/src/features/auth/utils/registerFormValidation.ts
index 9743163..e49fc02 100644
--- a/src/features/auth/utils/registerFormValidation.ts
+++ b/src/features/auth/utils/registerFormValidation.ts
@@ -1,7 +1,6 @@
 import { ValidationMessage } from "@/features/shared/types/validation.type";
 
 const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
-  // Zod (from w auth.types.ts)
   email_required: { text: "Email jest wymagany", type: "Dismiss" },
   email_invalid: { text: "Nieprawidłowy format Email", type: "Dismiss" },
   password_too_short: {
@@ -22,12 +21,13 @@ const ERROR_DICTIONARY: Record<string, ValidationMessage> = {
   name_too_long: { text: "Nazwa jest za długa", type: "Dismiss" },
   name_invalid_chars: { text: "Niedozwolone znaki w nazwie", type: "Dismiss" },
 
-  // API (Firebase / Backend)
   "auth/email-already-exists": {
     text: "Ten email jest już zajęty",
     type: "Dismiss",
   },
-  "auth/username_taken": {
+
+  // API
+  CONFLICT: {
     text: "Ta nazwa użytkownika jest zajęta",
     type: "Dismiss",
   },
diff --git a/src/features/comments/api/commentService.ts b/src/features/comments/api/commentService.ts
index 1ad108f..b5fd1da 100644
--- a/src/features/comments/api/commentService.ts
+++ b/src/features/comments/api/commentService.ts
@@ -1,7 +1,7 @@
 import { adminDb } from "@/lib/firebaseAdmin";
 import { FieldValue } from "firebase-admin/firestore";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { AddCommentSchema, AddCommentDto } from "../types/comment.type";
 import { formatZodErrorFlat } from "@/lib/zod";
 import { performModeration } from "@/features/moderation/utils/assessSafety";
diff --git a/src/features/comments/hooks/useAddComment.ts b/src/features/comments/hooks/useAddComment.ts
index db5fe82..eb721c9 100644
--- a/src/features/comments/hooks/useAddComment.ts
+++ b/src/features/comments/hooks/useAddComment.ts
@@ -3,7 +3,7 @@ import axiosInstance from "@/lib/axiosInstance";
 import { AddCommentDto } from "../types/comment.type";
 import toast from "react-hot-toast";
 import { parseCommentErrorMessages } from "../utils/commentFormValidation";
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 
 export default function useAddComment(
   onSuccessCallback?: () => void,
diff --git a/src/features/images/api/imageService.ts b/src/features/images/api/imageService.ts
index b3dfd69..1be3089 100644
--- a/src/features/images/api/imageService.ts
+++ b/src/features/images/api/imageService.ts
@@ -1,6 +1,6 @@
 import admin from "firebase-admin";
 import { randomUUID } from "crypto";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import sharp from "sharp";
 
 const bucket = admin.storage().bucket();
diff --git a/src/features/likes/api/likeService.ts b/src/features/likes/api/likeService.ts
index bdb7c8d..df80555 100644
--- a/src/features/likes/api/likeService.ts
+++ b/src/features/likes/api/likeService.ts
@@ -1,5 +1,5 @@
 import { adminDb } from "@/lib/firebaseAdmin";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { Like } from "../types/like.type";
 import { FieldValue } from "firebase-admin/firestore";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
diff --git a/src/features/me/api/meService.ts b/src/features/me/api/meService.ts
index 0c24d5a..f91ee47 100644
--- a/src/features/me/api/meService.ts
+++ b/src/features/me/api/meService.ts
@@ -6,7 +6,7 @@ import {
   UpdateProfileData,
   UpdateProfileSchema,
 } from "../me.type";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { formatZodErrorFlat } from "@/lib/zod";
 
 export async function deleteAccount() {
@@ -50,7 +50,7 @@ export async function updateProfile(data: UpdateProfileData) {
   if (avatarFile !== undefined) {
     authUpdate.photoURL = "";
     dbUpdate.avatarUrl = null; //TODO add saving images from imageservice
-  }
+  } // i tez jezeli user aktualizuje avatar to masz uzyc delete funkcji na usuniecie starego avatara
 
   if (Object.keys(authUpdate).length > 0) {
     await adminAuth.updateUser(uid, authUpdate);
diff --git a/src/features/me/hooks/useUpdatePassword.ts b/src/features/me/hooks/useUpdatePassword.ts
index f6d685d..8e10aa9 100644
--- a/src/features/me/hooks/useUpdatePassword.ts
+++ b/src/features/me/hooks/useUpdatePassword.ts
@@ -10,6 +10,8 @@ import {
 } from "firebase/auth";
 import { auth } from "@/lib/firebase";
 import { useAppSelector } from "@/lib/store/hooks";
+import { ApiError } from "@/lib/AppError";
+import { FirebaseError } from "firebase/app";
 
 type ErrorCallback = (errorCode: string, field?: string) => void;
 
@@ -24,7 +26,7 @@ export const useUpdatePassword = (onError: ErrorCallback) => {
       const payload = { ...data, recaptchaToken: token };
       await axiosInstance.put(`/me/password`, payload);
     },
-    onError: (error: any) => {
+    onError: (error: ApiError) => {
       if (error.code) {
         toast.error(error.code);
       } else {
@@ -73,18 +75,22 @@ export const useUpdatePassword = (onError: ErrorCallback) => {
 
     try {
       await reauthenticateWithCredential(currentUser, credential);
-    } catch (error: any) {
-      if (
-        error.code === "auth/invalid-credential" ||
-        error.code === "auth/wrong-password"
-      ) {
-        onError("auth/wrong-password", "oldPassword");
-      } else if (error.code === "auth/too-many-requests") {
-        toast.error("Zbyt wiele prób. Spróbuj później.");
-      } else {
-        toast.error("Nie udało się zweryfikować starego hasła.");
+    } catch (error: unknown) {
+      if (error instanceof FirebaseError) {
+        if (
+          error.code === "auth/invalid-credential" ||
+          error.code === "auth/wrong-password"
+        ) {
+          onError("auth/wrong-password", "oldPassword");
+        } else if (error.code === "auth/too-many-requests") {
+          toast.error("Zbyt wiele prób. Spróbuj później.");
+        } else {
+          toast.error("Nie udało się zweryfikować starego hasła.");
+        }
+        return false;
       }
-      return false;
+      console.error(error);
+      toast.error("Wystąpił nieoczekiwany błąd.");
     }
 
     await mutation.mutateAsync(data);
diff --git a/src/features/me/hooks/useUpdateProfile.ts b/src/features/me/hooks/useUpdateProfile.ts
index fd78dd3..215527e 100644
--- a/src/features/me/hooks/useUpdateProfile.ts
+++ b/src/features/me/hooks/useUpdateProfile.ts
@@ -1,13 +1,13 @@
 import { useMutation } from "@tanstack/react-query";
 import axiosInstance from "@/lib/axiosInstance";
-import type { UserProfileUpdate } from "@/features/users/types/user.type";
 import { useRouter } from "next/navigation";
+import { UpdateProfileData } from "../me.type";
 
 export default function useUpdateProfile() {
   const router = useRouter();
 
   const mutation = useMutation({
-    mutationFn: async (data: UserProfileUpdate) => {
+    mutationFn: async (data: UpdateProfileData) => {
       const response = await axiosInstance.put(`/me/profile`, data);
       return response.data;
     },
diff --git a/src/features/moderation/api/imageModeration.ts b/src/features/moderation/api/imageModeration.ts
index 0111d03..bb75b43 100644
--- a/src/features/moderation/api/imageModeration.ts
+++ b/src/features/moderation/api/imageModeration.ts
@@ -1,4 +1,4 @@
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import OpenAI from "openai";
 
 const openai = new OpenAI();
diff --git a/src/features/moderation/api/textModeration.ts b/src/features/moderation/api/textModeration.ts
index 27c1668..28a4636 100644
--- a/src/features/moderation/api/textModeration.ts
+++ b/src/features/moderation/api/textModeration.ts
@@ -1,4 +1,4 @@
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import OpenAI from "openai";
 
 const openai = new OpenAI();
diff --git a/src/features/moderation/utils/assessSafety.ts b/src/features/moderation/utils/assessSafety.ts
index a79768a..0a06a24 100644
--- a/src/features/moderation/utils/assessSafety.ts
+++ b/src/features/moderation/utils/assessSafety.ts
@@ -1,7 +1,7 @@
 import { hasFile } from "@/features/images/api/imageService";
 import { moderateImage } from "@/features/moderation/api/imageModeration";
 import { moderateText } from "@/features/moderation/api/textModeration";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { logModerationEvent } from "@/features/moderator/api/moderationLogService";
 
 export type ModerationStatus = "approved" | "pending" | "rejected";
diff --git a/src/features/moderator/api/moderatorService.ts b/src/features/moderator/api/moderatorService.ts
index 3e808a4..df96091 100644
--- a/src/features/moderator/api/moderatorService.ts
+++ b/src/features/moderator/api/moderatorService.ts
@@ -1,6 +1,6 @@
 import { adminDb } from "@/lib/firebaseAdmin";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { Post } from "@/features/posts/types/post.type";
 import { FieldValue } from "firebase-admin/firestore";
 import { blockUser, unblockUser } from "@/features/users/api/userService";
diff --git a/src/features/posts/api/postService.ts b/src/features/posts/api/postService.ts
index d9cfc5d..8a9441e 100644
--- a/src/features/posts/api/postService.ts
+++ b/src/features/posts/api/postService.ts
@@ -1,7 +1,7 @@
 import admin from "firebase-admin";
 import { adminDb } from "@/lib/firebaseAdmin";
 import { getUserFromSession } from "@/features/auth/api/utils/verifySession";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import {
   CreatePostSchema,
   UpdatePostSchema,
@@ -12,13 +12,8 @@ import {
 } from "../types/post.type";
 import { formatZodErrorFlat } from "@/lib/zod";
 
-import {
-  uploadImage,
-  deleteImage,
-  hasFile,
-} from "@/features/images/api/imageService";
+import { deleteImage } from "@/features/images/api/imageService";
 import { FieldValue } from "firebase-admin/firestore";
-import { performModeration } from "../../moderation/utils/assessSafety";
 import processPostContent from "./postHelpers";
 
 const POSTS_COLLECTION = "posts";
diff --git a/src/features/posts/hooks/useCreatePost.ts b/src/features/posts/hooks/useCreatePost.ts
index e67bb58..1669445 100644
--- a/src/features/posts/hooks/useCreatePost.ts
+++ b/src/features/posts/hooks/useCreatePost.ts
@@ -3,8 +3,8 @@ import { useMutation, useQueryClient } from "@tanstack/react-query";
 import type { CreatePost } from "../types/post.type";
 
 export default function useCreatePost(
-  onSuccess?: (data?: any) => void,
-  onError?: (error?: any) => void
+  successCallBack?: (data?: any) => void,
+  errorCallBack?: (error?: any) => void
 ) {
   const queryClient = useQueryClient();
 
@@ -28,11 +28,11 @@ export default function useCreatePost(
       await queryClient.invalidateQueries({
         queryKey: ["posts"],
       });
-      onSuccess?.(data);
+      successCallBack?.(data);
     },
 
     onError: (error) => {
-      onError?.(error);
+      errorCallBack?.(error);
     },
   });
 
diff --git a/src/features/posts/hooks/useReportPost.ts b/src/features/posts/hooks/useReportPost.ts
index e45fe5b..f613437 100644
--- a/src/features/posts/hooks/useReportPost.ts
+++ b/src/features/posts/hooks/useReportPost.ts
@@ -1,7 +1,7 @@
 import { useMutation } from "@tanstack/react-query";
 import axiosInstance from "@/lib/axiosInstance";
 import toast from "react-hot-toast";
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 
 type ReportPayload = {
   postId: string;
diff --git a/src/features/posts/utils/postFormValidation.ts b/src/features/posts/utils/postFormValidation.ts
index c84f8aa..40e1fb1 100644
--- a/src/features/posts/utils/postFormValidation.ts
+++ b/src/features/posts/utils/postFormValidation.ts
@@ -28,12 +28,6 @@ const ERROR_DICTIONARY: Record<
     text: "Niedozwolony format pliku.",
     field: "imageFile",
   },
-
-  default: {
-    type: "Dismiss",
-    text: "Wystąpił nieznany błąd.",
-    field: "root",
-  },
 };
 
 export function parseErrorMessages(errorCode: string):
diff --git a/src/features/users/api/userService.ts b/src/features/users/api/userService.ts
index e50e7ef..abb7532 100644
--- a/src/features/users/api/userService.ts
+++ b/src/features/users/api/userService.ts
@@ -6,7 +6,7 @@ import type {
   UserProfile,
   UserRestrictionData,
 } from "../types/user.type";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import { ensureModeratorOrAdmin } from "@/features/moderator/api/moderatorService";
 
 export async function createUserDocument(
diff --git a/src/i18n/errorTranslator.ts b/src/i18n/errorTranslator.ts
index c554ab3..675388f 100644
--- a/src/i18n/errorTranslator.ts
+++ b/src/i18n/errorTranslator.ts
@@ -1,4 +1,4 @@
-import { ApiError } from "@/lib/ApiError";
+import { ApiError } from "@/lib/AppError";
 
 const translations: Record<string, Record<string, string>> = {
   pl: {
diff --git a/src/lib/ApiError.ts b/src/lib/ApiError.ts
deleted file mode 100644
index 6ce40ef..0000000
--- a/src/lib/ApiError.ts
+++ /dev/null
@@ -1,84 +0,0 @@
-export type ErrorCode =
-  | "AUTH_REQUIRED"
-  | "INVALID_CREDENTIALS"
-  | "FORBIDDEN"
-  | "NOT_FOUND"
-  | "VALIDATION_ERROR"
-  | "RATE_LIMIT"
-  | "EXTERNAL_SERVICE"
-  | "DB_ERROR"
-  | "INTERNAL_ERROR"
-  | "INVALID_INPUT"
-  | "CONFLICT"
-  | "NETWORK_TIMEOUT"
-  | "NETWORK_ERROR"
-  | "NO_SESSION"
-  | "USER_NOT_FOUND"
-  | "INVALID_SESSION"
-  | "UNAUTHORIZED_ACTION"
-  | "SERVICE_UNAVAILABLE"
-  | "POLICY_VIOLATION";
-
-type AppErrorArgs = {
-  code?: ErrorCode;
-  message?: string;
-  status?: number;
-  details?: any;
-  data?: Record<string, any>;
-};
-
-export class ApiError extends Error {
-  public code: ErrorCode;
-  public status: number;
-  public details?: any;
-  public data?: Record<string, any>;
-
-  constructor(opts?: AppErrorArgs) {
-    super(opts?.message ?? "Unknown error appear");
-    this.name = "ApiError";
-    this.code = opts?.code ?? "INTERNAL_ERROR";
-    this.status = opts?.status ?? 500;
-    this.details = opts?.details;
-    this.data = opts?.data;
-  }
-}
-
-export const createAppError = (args: AppErrorArgs) => {
-  const defaultMessages: Record<ErrorCode, { msg: string; status: number }> = {
-    AUTH_REQUIRED: { msg: "Authentication required", status: 401 },
-    INVALID_CREDENTIALS: { msg: "Invalid credentials", status: 401 },
-    FORBIDDEN: { msg: "Forbidden", status: 403 },
-    NOT_FOUND: { msg: "Resource not found", status: 404 },
-    VALIDATION_ERROR: { msg: "Validation error", status: 400 },
-    RATE_LIMIT: { msg: "Too many requests", status: 429 },
-    EXTERNAL_SERVICE: { msg: "External service error", status: 502 },
-    DB_ERROR: { msg: "Database error", status: 500 },
-    INTERNAL_ERROR: { msg: "Internal server error", status: 500 },
-    INVALID_INPUT: { msg: "Invalid input", status: 400 },
-    CONFLICT: { msg: "Conflict", status: 409 },
-    NETWORK_TIMEOUT: { msg: "Network timeout", status: 504 },
-    NETWORK_ERROR: { msg: "Network error", status: 503 },
-    NO_SESSION: { msg: "Session not found", status: 401 },
-    USER_NOT_FOUND: { msg: "User not found", status: 404 },
-    INVALID_SESSION: { msg: "Invalid session token", status: 401 },
-    UNAUTHORIZED_ACTION: { msg: "You cannot perform this action", status: 403 },
-    SERVICE_UNAVAILABLE: { msg: "Service unavailable", status: 503 },
-    POLICY_VIOLATION: {
-      msg: "Content violates community guidelines",
-      status: 422,
-    },
-  };
-
-  const def = defaultMessages[args.code ?? "INTERNAL_ERROR"];
-  const message = args.message ?? def.msg;
-  const status = args.status ?? def.status;
-  const code = args.code ?? "INTERNAL_ERROR";
-
-  return new ApiError({
-    message,
-    status,
-    code,
-    data: args.data,
-    details: args.details,
-  });
-};
diff --git a/src/lib/axiosInstance.ts b/src/lib/axiosInstance.ts
index a7f541d..855df8c 100644
--- a/src/lib/axiosInstance.ts
+++ b/src/lib/axiosInstance.ts
@@ -1,119 +1,72 @@
 import axios from "axios";
+import { ApiError } from "./AppError";
 
-// Create Axios instance with basic settings
 const axiosInstance = axios.create({
   baseURL: process.env.NEXT_PUBLIC_API_URL,
   withCredentials: true,
   timeout: 10000,
-  // headers: { "Content-Type": "application/json", Accept: "application/json" },
 });
 
-// Helper - wraps the error without creating class instances
-function wrapError(payload: any) {
-  return {
-    isApiError: true,
-    ...payload,
-  };
-}
-
-// ---------------------
-//   RESPONSE SUCCESS
-// ---------------------
 axiosInstance.interceptors.response.use(
   (res) => {
     const body = res?.data;
 
-    if (body && typeof body === "object") {
-      // Case: { ok: false, error: {...} }
-      if (body.ok === false && body.error) {
-        throw wrapError({
-          code: body.error.code ?? "INTERNAL_ERROR",
-          message: body.error.message ?? "Unknown error",
-          status: res?.status ?? body.error.status ?? 500,
-          details: body.error.details,
-          data: body.error.data,
-        });
-      }
-
-      // Case: { ok: true, data: ... }
-      if (body.ok === true && "data" in body) {
-        return { ...res, data: body.data };
-      }
+    // If the response is correct (ok: true), return only the data
+    if (
+      body &&
+      typeof body === "object" &&
+      body.ok === true &&
+      "data" in body
+    ) {
+      return { ...res, data: body.data };
     }
-
     return res;
   },
-
-  // ---------------------
-  //   RESPONSE ERROR
-  // ---------------------
   (error) => {
     const resp = error?.response;
     const respData = resp?.data;
 
-    // 1. If the backend returned a standard ApiError JSON (even with a 404 status)
-    if (respData && typeof respData === "object") {
-      if (respData.ok === false && respData.error) {
-        throw wrapError({
-          code: respData.error.code ?? "INTERNAL_ERROR",
-          message: respData.error.message ?? "Unknown error",
-          status: resp?.status ?? respData.error.status ?? 500,
-          details: respData.error.details,
-          data: respData.error.data,
-        });
-      }
+    // 1. Handle API logic errors (e.g. invalid password)
+    // The backend sends structured error data
+    if (
+      respData &&
+      typeof respData === "object" &&
+      respData.ok === false &&
+      respData.error
+    ) {
+      throw new ApiError({
+        code: respData.error.code,
+        status: resp?.status,
+        data: respData.error.data,
+        // The message is generated automatically by ApiError class
+      });
     }
 
-    // 2. Handle specific HTTP 404 error (when JSON body is missing or empty) 🐤
+    // 2. Handle 404 error (Page or resource not found)
     if (resp?.status === 404) {
-      throw wrapError({
+      throw new ApiError({
         code: "NOT_FOUND",
-        message: "Resource not found (404)",
         status: 404,
-        details: respData || "Endpoint does not exist",
       });
     }
 
-    // 3. Any other structured error (without the ok: false flag) or HTML error response
+    // 3. Handle other server errors (e.g. 500 Internal Server Error)
     if (resp) {
-      throw wrapError({
+      throw new ApiError({
         code: "EXTERNAL_SERVICE",
-        message: resp?.statusText || "External service error",
         status: resp?.status ?? 502,
-        details: { raw: respData },
       });
     }
 
-    // 4. Timeout handling
-    if (error?.code === "ECONNABORTED") {
-      throw wrapError({
-        code: "NETWORK_TIMEOUT",
-        message: "Request timed out",
-        status: 408,
-        details: safeSerialize(error),
-      });
-    }
-
-    // 5. Generic network error (e.g., no internet connection)
-    throw wrapError({
-      code: "NETWORK_ERROR",
-      message: error?.message ?? "Network error",
+    // 4. Handle network issues (timeout or no internet connection)
+    const code =
+      error?.code === "ECONNABORTED" ? "NETWORK_TIMEOUT" : "NETWORK_ERROR";
+    throw new ApiError({
+      code: code,
       status: 0,
-      details: safeSerialize(error),
     });
   }
 );
 
-// ---------------------
-function safeSerialize(err: any) {
-  if (!err) return err;
-  try {
-    if (err instanceof Error) {
-      return { message: err.message, name: err.name, stack: err.stack };
-    }
-    return JSON.parse(JSON.stringify(err));
-  } catch {
-    return String(err);
-  }
-}
-
 export default axiosInstance;
diff --git a/src/lib/http/routeWrapper.ts b/src/lib/http/routeWrapper.ts
index c0bb8d5..6a20f6a 100644
--- a/src/lib/http/routeWrapper.ts
+++ b/src/lib/http/routeWrapper.ts
@@ -1,5 +1,5 @@
 import { handleError } from "./responseHelpers";
-import { ApiError } from "../ApiError";
+import { AppError } from "../AppError";
 import { NextRequest } from "next/server";
 
 export function withErrorHandling(
@@ -9,12 +9,12 @@ export function withErrorHandling(
     try {
       return await handler(req, context);
     } catch (caught) {
-      let apiError: ApiError;
+      let appError: AppError;
 
-      if (caught instanceof ApiError) {
-        apiError = caught;
+      if (caught instanceof AppError) {
+        appError = caught;
       } else if (caught instanceof Error) {
-        apiError = new ApiError({
+        appError = new AppError({
           message: caught.message || "Unexpected error",
           details: {
             message: caught.message,
@@ -22,18 +22,18 @@ export function withErrorHandling(
           },
         });
       } else {
-        apiError = new ApiError({
+        appError = new AppError({
           message: typeof caught === "string" ? caught : "Non-error thrown",
           details: { raw: caught },
         });
       }
 
       return handleError(
-        apiError.code,
-        apiError.message,
-        apiError.data,
-        apiError.status,
-        apiError.details
+        appError.code,
+        appError.message,
+        appError.data,
+        appError.status,
+        appError.details
       );
     }
   };
diff --git a/src/lib/recaptcha.ts b/src/lib/recaptcha.ts
index af6ccaa..47a75f4 100644
--- a/src/lib/recaptcha.ts
+++ b/src/lib/recaptcha.ts
@@ -1,4 +1,4 @@
-import { createAppError } from "./ApiError";
+import { createAppError } from "./AppError";
 
 const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
 const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
diff --git a/src/lib/security/rateLimitService.ts b/src/lib/security/rateLimitService.ts
index f48815c..4207c40 100644
--- a/src/lib/security/rateLimitService.ts
+++ b/src/lib/security/rateLimitService.ts
@@ -1,5 +1,5 @@
 import { adminDb } from "@/lib/firebaseAdmin";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import admin from "firebase-admin";
 
 // Configuration constants
diff --git a/src/lib/security/throttleService.ts b/src/lib/security/throttleService.ts
index 3bdf54b..f65d569 100644
--- a/src/lib/security/throttleService.ts
+++ b/src/lib/security/throttleService.ts
@@ -1,5 +1,5 @@
 import { adminDb } from "@/lib/firebaseAdmin";
-import { createAppError } from "@/lib/ApiError";
+import { createAppError } from "@/lib/AppError";
 import admin from "firebase-admin";
 
 const WINDOW_SIZE_MS = 60 * 1000;
```
