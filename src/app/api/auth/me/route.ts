import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { verifySession } from "@/features/auth/api/utils/verifySession";

export async function GET(req: Request) {
  try {
    const decoded = await verifySession(req);

    const uid = decoded.uid;
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const userSnap = userDoc.data();

    return NextResponse.json({
      ok: true,
      user: {
        uid,
        email: decoded.email ?? null,
        name: userSnap?.name ?? null,
        role: userSnap?.role ?? "user",
      },
      expiresAt: decoded.exp ? decoded.exp * 1000 : undefined,
    });
  } catch (error: any) {
    console.warn("auth/me verify failed:", error?.message ?? error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
