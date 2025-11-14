import { NextResponse } from "next/server";
import { deleteAccount } from "@/features/me/api/meService";
export async function DELETE(req: Request) {
  try {
    await deleteAccount();
    return NextResponse.json(
      { ok: true, message: "Konto usunięte" },
      { status: 200 }
    );
  } catch (error) {
    console.error("deleteCurrentUser error:", error);
    return NextResponse.json(error, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import { adminDb } from "@/lib/firebaseAdmin";
// import { getUserFromSession } from "@/features/auth/api/utils/verifySession";

// export async function GET(req: Request) {
//   try {
//     const decoded = await getUserFromSession();

//     if (!decoded) {
//       console.warn("Brak decoded token w auth/me");
//       return NextResponse.json({ ok: false }, { status: 401 });
//     }

//     const { name, email } = decoded;

//     if (!uid) {
//       console.warn("Brak UID w decoded token");
//       return NextResponse.json({ ok: false }, { status: 401 });
//     }

//     const userDoc = await adminDb.collection("users").doc(uid).get();

//     if (!userDoc.exists) {
//       console.warn(`Użytkownik nie istnieje w Firestore: ${uid}`);
//       return NextResponse.json({ ok: false }, { status: 401 });
//     }

//     const userData = userDoc.data();

//     const responseData = {
//       ok: true,
//       user: {
//         uid,
//         email: email ?? null,
//         name: userData?.name ?? null,
//         role: userData?.role ?? "user",
//       },
//       expiresAt: decoded.exp ? decoded.exp * 1000 : undefined,
//     };

//     return NextResponse.json(responseData);
//   } catch (error: unknown) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     console.warn("auth/me verify failed:", errorMessage);

//     return NextResponse.json({ ok: false }, { status: 401 });
//   }
// }
