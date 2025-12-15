import { handleError } from "./responseHelpers";
import { AppError } from "../AppError";
import { NextRequest } from "next/server";

export function withErrorHandling(
  handler: (req: NextRequest, context?: any) => Promise<Response | any>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (caught) {
      let appError: AppError;

      if (caught instanceof AppError) {
        appError = caught;
      } else if (caught instanceof Error) {
        appError = new AppError({
          message: caught.message || "Unexpected error",
          details: {
            message: caught.message,
            stack: caught.stack ?? undefined,
          },
        });
      } else {
        appError = new AppError({
          message: typeof caught === "string" ? caught : "Non-error thrown",
          details: { raw: caught },
        });
      }

      return handleError(
        appError.code,
        appError.message,
        appError.data,
        appError.status,
        appError.details
      );
    }
  };
}
