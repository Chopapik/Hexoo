import { NextResponse } from "next/server";
import { createUser } from "@/features/admin/api/adminService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const users = await createUser(body);
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
