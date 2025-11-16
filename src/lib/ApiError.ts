// export type ErrorCode =
//   | "AUTH_REQUIRED"
//   | "INVALID_CREDENTIALS"
//   | "FORBIDDEN"
//   | "NOT_FOUND"
//   | "VALIDATION_ERROR"
//   | "RATE_LIMIT"
//   | "EXTERNAL_SERVICE"
//   | "DB_ERROR"
//   | "UNKNOWN_ERROR"
//   | "INVALID_INPUT"
//   | "CONFLICT"
//   | "NETWORK_TIMEOUT"
//   | "NETWORK_ERROR";

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, any>;
  public level: "info" | "warn" | "error" | "critical";
  public type: "validation" | undefined;

  constructor(
    message: string, //default Error variable
    opts?: {
      status?: number;
      code?: string;
      details?: Record<string, any>;
      level?: "info" | "warn" | "error" | "critical";
      type?: "validation";
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status ?? 500;
    this.code = opts?.code ?? "UNKNOWN_ERROR";
    this.details = opts?.details;
    this.level = opts?.level ?? "error";
    this.type = opts?.type;
  }
}

type AppErrorArgs = {
  code: string;
  message?: string;
  status?: number;
  details?: Record<string, any>;
};

export const createAppError = (args: AppErrorArgs) => {
  const defaultMessages: Record<string, { msg: string; status: number }> = {
    AUTH_REQUIRED: { msg: "Authentication required", status: 401 },
    INVALID_CREDENTIALS: { msg: "Invalid credentials", status: 401 },
    FORBIDDEN: { msg: "Forbidden", status: 403 },
    NOT_FOUND: { msg: "Resource not found", status: 404 },
    VALIDATION_ERROR: { msg: "Validation error", status: 400 },
    RATE_LIMIT: { msg: "Too many requests", status: 429 },
    EXTERNAL_SERVICE: { msg: "External service error", status: 502 },
    DB_ERROR: { msg: "Database error", status: 500 },
    UNKNOWN_ERROR: { msg: "Internal server error", status: 500 },
    INVALID_INPUT: { msg: "Invalid input", status: 400 },
    CONFLICT: { msg: "Conflict", status: 409 },
  };

  const { code, message, details } = args;
  const def = defaultMessages[code] ?? defaultMessages.UNKNOWN_ERROR;

  console.warn("[AppError]", {
    code,
    status: args.status ?? def.status,
    message: message ?? def.msg,
    details,
  });

  return new ApiError(message ?? def.msg, {
    status: args.status ?? def.status,
    code,
    details,
  });
};
