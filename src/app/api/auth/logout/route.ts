import { logoutUser } from "@/features/auth/api/authService";
import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/http/routeWrapper";
import { sendSuccess } from "@/lib/http/responseHelpers";

// export async function POST() {
//   try {
//     await logoutUser();
//     return NextResponse.json({ ok: true, message: "Session cleared" });
//   } catch (error: any) {
//     return NextResponse.json(error, { status: error.code });
//   }
// }

export const POST = withErrorHandling(async () => {
  const result = await logoutUser();
  return sendSuccess(result);
});
