import { NextResponse } from "next/server";
import { ApiError } from "../ApiError";
import { sendError } from "./responseHelpers";

export function withErrorHandling(
  handler: (req: Request, context?: any) => Promise<Response | NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      const e =
        error instanceof ApiError
          ? error
          : new ApiError("Internal server error", {
              status: 500,
            });

      if (error instanceof Error && !(error instanceof ApiError)) {
        console.error(error);
      }

      return sendError(e.code, e.status, e.details);
    }
  };
}
