export type ErrorCode =
  | "AUTH_REQUIRED"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT"
  | "EXTERNAL_SERVICE"
  | "DB_ERROR"
  | "INTERNAL_ERROR"
  | "INVALID_INPUT"
  | "CONFLICT"
  | "NETWORK_TIMEOUT"
  | "NETWORK_ERROR"
  | "NO_SESSION"
  | "USER_NOT_FOUND"
  | "INVALID_SESSION"
  | "UNAUTHORIZED_ACTION"
  | "SERVICE_UNAVAILABLE"
  | "POLICY_VIOLATION";

type AppErrorArgs = {
  code?: ErrorCode;
  message?: string;
  status?: number;
  details?: any;
  data?: Record<string, any>;
};

export class AppError extends Error {
  public code: ErrorCode;
  public status: number;
  public details?: any;
  public data?: Record<string, any>;

  constructor(opts?: AppErrorArgs) {
    super(opts?.message ?? "Unknown error appear");
    this.name = "AppError";
    this.code = opts?.code ?? "INTERNAL_ERROR";
    this.status = opts?.status ?? 500;
    this.details = opts?.details;
    this.data = opts?.data;
  }
}

export class ApiError extends AppError {
  constructor(opts: Omit<AppErrorArgs, "message" | "details">) {
    super({
      ...opts,
      message: `ApiError: ${opts.code ?? "UNKNOWN"}`,
    });
    this.name = "ApiError";
  }
}

export const createAppError = (args: AppErrorArgs) => {
  const defaultMessages: Record<ErrorCode, { msg: string; status: number }> = {
    AUTH_REQUIRED: { msg: "Authentication required", status: 401 },
    INVALID_CREDENTIALS: { msg: "Invalid credentials", status: 401 },
    FORBIDDEN: { msg: "Forbidden", status: 403 },
    NOT_FOUND: { msg: "Resource not found", status: 404 },
    VALIDATION_ERROR: { msg: "Validation error", status: 400 },
    RATE_LIMIT: { msg: "Too many requests", status: 429 },
    EXTERNAL_SERVICE: { msg: "External service error", status: 502 },
    DB_ERROR: { msg: "Database error", status: 500 },
    INTERNAL_ERROR: { msg: "Internal server error", status: 500 },
    INVALID_INPUT: { msg: "Invalid input", status: 400 },
    CONFLICT: { msg: "Conflict", status: 409 },
    NETWORK_TIMEOUT: { msg: "Network timeout", status: 504 },
    NETWORK_ERROR: { msg: "Network error", status: 503 },
    NO_SESSION: { msg: "Session not found", status: 401 },
    USER_NOT_FOUND: { msg: "User not found", status: 404 },
    INVALID_SESSION: { msg: "Invalid session token", status: 401 },
    UNAUTHORIZED_ACTION: { msg: "You cannot perform this action", status: 403 },
    SERVICE_UNAVAILABLE: { msg: "Service unavailable", status: 503 },
    POLICY_VIOLATION: {
      msg: "Content violates community guidelines",
      status: 422,
    },
  };

  const def = defaultMessages[args.code ?? "INTERNAL_ERROR"];
  const message = args.message ?? def.msg;
  const status = args.status ?? def.status;
  const code = args.code ?? "INTERNAL_ERROR";

  return new AppError({
    message,
    status,
    code,
    data: args.data,
    details: args.details,
  });
};
