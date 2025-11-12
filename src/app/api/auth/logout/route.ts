import { logoutUser } from "@/features/auth/api/authService";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ ok: true, message: "Session cleared" });
  } catch (error: any) {
    return NextResponse.json(error, { status: error.code });
  }
}
