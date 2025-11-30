import { handleError } from "./responseHelpers";
import { ApiError } from "../ApiError";

export function withErrorHandling(
  handler: (req: Request, context?: any) => Promise<Response | any>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (caught) {
      let apiError: ApiError;

      if (caught instanceof ApiError) {
        apiError = caught;
      } else if (caught instanceof Error) {
        apiError = new ApiError({
          message: caught.message || "Unexpected error",
          details: {
            message: caught.message,
            stack: caught.stack ?? undefined,
          },
        });
      } else {
        apiError = new ApiError({
          message: typeof caught === "string" ? caught : "Non-error thrown",
          details: { raw: caught },
        });
      }

      return handleError(
        apiError.code,
        apiError.message,
        apiError.data,
        apiError.status,
        apiError.details
      );
    }
  };
}
