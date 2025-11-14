import { NextResponse } from "next/server";
import { getAllUsers } from "@/features/admin/api/adminService";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
