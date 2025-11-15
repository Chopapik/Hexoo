import { getUserProfile } from "@/features/users/api/userService";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = await params;

    const userProfile = await getUserProfile(name);
    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error("getUserProfile error:", error);
    return NextResponse.json(error, { status: 500 });
  }
}
