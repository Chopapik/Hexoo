import { NextResponse } from "next/server";
import { adminGetAllUsers } from "@/features/admin/api/adminService";

export async function GET() {
  try {
    const users = await adminGetAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
