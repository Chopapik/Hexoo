export type SuccessResponse<T = any> = {
  ok: true;
  data: T;
};

export type ErrorPayload = {
  code: string;
  data?: Record<string, any>;
};

export type ErrorResponse = {
  ok: false;
  error: ErrorPayload;
};

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
