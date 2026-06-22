export type SuccessResponse<T = unknown> = {
  ok: true;
  data: T;
};

export type ErrorPayload = {
  code: string;
  message?: string;
  data?: Record<string, unknown>;
};

export type ErrorResponse = {
  ok: false;
  error: ErrorPayload;
};

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
