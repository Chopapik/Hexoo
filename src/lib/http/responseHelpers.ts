import { NextResponse } from "next/server";
import { ApiResponse } from "@/features/shared/types/api.type";

export function sendSuccess<T>(data: T, status = 200) {
  const payload: ApiResponse<T> = { ok: true, data };
  return NextResponse.json(payload, { status });
}

export function sendError(
  code: string,
  // message: string,
  status = 500,
  details?: Record<string, any>
) {
  const payload: ApiResponse = {
    ok: false,
    error: { code, details },
  };
  return NextResponse.json(payload, { status });
}
