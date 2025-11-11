import { loginUser } from "@/features/auth/api/authService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const loginData = await req.json();
    const result = await loginUser(loginData);

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
