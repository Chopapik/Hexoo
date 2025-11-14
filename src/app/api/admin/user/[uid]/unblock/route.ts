import { NextRequest, NextResponse } from "next/server";
import { unblockUser } from "@/features/admin/api/adminService";
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await context.params;
    await unblockUser(uid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
