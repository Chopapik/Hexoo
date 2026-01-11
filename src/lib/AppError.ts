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
  | "POLICY_VIOLATION"
  | "ACCOUNT_BANNED"
  | "SECURITY_LOCKOUT"
  | "RATE_LIMIT";

const ErrorStatusMap: Record<ErrorCode, number> = {
  AUTH_REQUIRED: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  RATE_LIMIT: 429,
  EXTERNAL_SERVICE: 502,
  DB_ERROR: 500,
  INTERNAL_ERROR: 500,
  INVALID_INPUT: 400,
  CONFLICT: 409,
  NETWORK_TIMEOUT: 504,
  NETWORK_ERROR: 503,
  NO_SESSION: 401,
  USER_NOT_FOUND: 404,
  INVALID_SESSION: 401,
  UNAUTHORIZED_ACTION: 403,
  SERVICE_UNAVAILABLE: 503,
  POLICY_VIOLATION: 422,
  ACCOUNT_BANNED: 403,
  SECURITY_LOCKOUT: 423,
};

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
    super(opts?.message ?? opts?.code ?? "INTERNAL_ERROR");

    this.name = "AppError";
    this.code = opts?.code ?? "INTERNAL_ERROR";
    this.status = opts?.status ?? ErrorStatusMap[this.code] ?? 500;
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
  return new AppError(args);
};
