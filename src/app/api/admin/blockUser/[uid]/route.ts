import { blockUser } from "@/features/admin/api/adminService";

export async function PUT(
  req: Request,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await context.params;
    const result = await blockUser(uid);
    return Response.json({ ok: true, user: result }, { status: 200 });
  } catch (error) {
    console.error("PUT /admin/user/blockUser error:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
