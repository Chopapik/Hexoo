import { NextResponse } from "next/server";
import { ApiResponse } from "@/features/shared/types/api.type";

function sendSuccess<T>(data: T, status = 200) {
  if (status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const payload: ApiResponse<T> = { ok: true, data };
  return NextResponse.json(payload, { status });
}

export function handleSuccess<T>(data?: T, status = 200) {
  return sendSuccess(data, status);
}

function sendError(code: string, status = 500, data?: Record<string, unknown>) {
  const payload: ApiResponse = {
    ok: false,
    error: { code, data },
  };

  return NextResponse.json(payload, { status });
}

export function handleError<T>(
  code: string,
  message: string,
  data?: Record<string, unknown>,
  status = 500,
  details?: unknown,
) {
  //to do, logging success
  console.warn(`message: ${message} details: ${details}`); //in future replaced by logging system
  return sendError(code, status, data);
}
