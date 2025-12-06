import { NextResponse } from "next/server";
import { ApiResponse } from "@/features/shared/types/api.type";

function sendSuccess<T>(data: T, status = 200) {
  //to do, logging success
  const payload: ApiResponse<T> = { ok: true, data };
  return NextResponse.json(payload, { status });
}

export function handleSuccess<T>(data?: T, status = 200) {
  return sendSuccess(data, status);
}

function sendError(code: string, status = 500, data?: Record<string, any>) {
  const payload: ApiResponse = {
    ok: false,
    error: { code, data },
  };

  return NextResponse.json(payload, { status });
}

export function handleError<T>(
  code: string,
  message: string,
  data?: Record<string, any>,
  status = 500,
  details?: Record<string, any>
) {
  //to do, logging success
  console.warn(`message: ${message} details: ${details}`); //in future replaced by logging system
  return sendError(code, status, data);
}
