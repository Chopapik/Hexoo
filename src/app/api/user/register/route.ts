import { NextResponse } from "next/server";
import { registerUser } from "@/features/auth/api/authService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerUser(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(error, { status: error.code });
  }
}
