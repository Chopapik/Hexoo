import { NextResponse } from "next/server";
import { registerUser } from "@/features/auth/api/authService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerUser(body);

    if (result?.ok) {
      const response = NextResponse.json({ user: result.user });
      response.cookies.set({
        name: "session",
        value: result.sessionCookie,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 5,
        path: "/",
      });
      return response;
    }
  } catch (error: any) {
    return NextResponse.json(error, { status: error.code });
  }
}
