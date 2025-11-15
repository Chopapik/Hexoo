import { adminUpdateUserPassword } from "@/features/admin/api/adminService";

export async function PUT(
  req: Request,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const body = await req.json();
    const { uid } = await context.params;

    const { newPassword } = body;

    const result = await adminUpdateUserPassword(uid, newPassword);

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("PUT user error:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
