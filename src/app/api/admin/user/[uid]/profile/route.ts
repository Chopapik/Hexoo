import { updateUserProfile } from "@/features/admin/api/adminService";

export async function PUT(
  req: Request,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const body = await req.json();
    const { uid } = await context.params;
    const result = await updateUserProfile(uid, body);

    return Response.json({ ok: true, user: result }, { status: 200 });
  } catch (error) {
    console.error("PUT user error:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
