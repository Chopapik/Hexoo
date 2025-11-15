import { NextResponse } from "next/server";
import { updatePassword } from "@/features/me/api/meService";
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data) {
      console.warn("Brak data w updatePassword ");
      return NextResponse.json({ status: 500 });
    }

    const result = await updatePassword(data);

    if (result) {
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
    console.warn("Blad w uzyskiwaniu result w updatePassword ");

    NextResponse.json({ status: 500 });
    console.warn("");
  } catch (error) {
    console.error("deleteCurrentUser error:", error);
    return NextResponse.json(error, { status: 500 });
  }
}
