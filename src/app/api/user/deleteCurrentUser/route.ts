import { NextResponse } from "next/server";
import { deleteCurrentUser } from "@/features/users/api/userService";
export async function DELETE(req: Request) {
  try {
    await deleteCurrentUser();
    return NextResponse.json(
      { ok: true, message: "Konto usunięte" },
      { status: 200 }
    );
  } catch (error) {
    console.error("deleteCurrentUser error:", error);
    return NextResponse.json(error, { status: 500 });
  }
}
