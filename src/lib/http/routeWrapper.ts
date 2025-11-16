import { NextResponse } from "next/server";
import { ApiError } from "../ApiError";
import { sendError } from "./responseHelpers";

export function withErrorHandling(
  handler: (req: Request) => Promise<Response | NextResponse>
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      const e =
        error instanceof ApiError
          ? error
          : new ApiError("Internal server error", { status: 500 });

      return sendError(e.code, e.message, e.status, e.details);
    }
  };
}
