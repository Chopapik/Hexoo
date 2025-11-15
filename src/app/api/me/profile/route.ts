import { NextResponse } from "next/server";
import { updateProfile } from "@/features/me/api/meService";

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data) {
      console.warn("Brak data w updateProfile ");
      return NextResponse.json({ status: 500 });
    }
    const newData = await updateProfile(data);

    return NextResponse.json(
      { ok: true, message: "Profil zaktualozwany", newData: newData },
      { status: 200 }
    );
  } catch (error) {
    console.error("deleteCurrentUser error:", error);
    return NextResponse.json(error, { status: 500 });
  }
}
