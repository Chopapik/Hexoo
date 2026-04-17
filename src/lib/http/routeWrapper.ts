import { handleError } from "./responseHelpers";
import { AppError } from "../AppError";
import { NextRequest } from "next/server";

export type RouteParamValue = string | string[] | undefined;
export type AnyRouteParams = Record<string, RouteParamValue>;

export type AnyRouteContext<P extends AnyRouteParams = AnyRouteParams> = {
  params: Promise<P>;
};

export function withErrorHandling<P extends AnyRouteParams>(
  handler: (req: NextRequest, context: AnyRouteContext<P>) => Promise<Response>,
) {
  return async (req: NextRequest, context: AnyRouteContext<P>) => {
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
        appError.details,
      );
    }
  };
}
