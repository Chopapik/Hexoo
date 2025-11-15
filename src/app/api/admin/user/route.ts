import { NextResponse } from "next/server";
import { adminCreateUserAccount } from "@/features/admin/api/adminService";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const users = await adminCreateUserAccount(body);
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { adminUpdateUserAccount } from "@/features/admin/api/adminService";

export async function PUT(
  req: Request,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const body = await req.json();
    const { uid } = await context.params;
    const result = await adminUpdateUserAccount(uid, body);

    return NextResponse.json({ ok: true, user: result }, { status: 200 });
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
