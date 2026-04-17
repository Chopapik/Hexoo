import { ApiError } from "./AppError";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const DEFAULT_TIMEOUT = 10000;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ApiErrorArgs = ConstructorParameters<typeof ApiError>[0];
type ApiErrorCode = ApiErrorArgs["code"];
type ApiErrorData = ApiErrorArgs["data"];

/**
 * Options for convenience methods (get, post, put, etc.)
 * method and body are excluded because they're passed separately in each method
 */
interface FetchOptions extends Omit<RequestInit, "method" | "body"> {
  timeout?: number;
}

/**
 * Internal request configuration used by the request function
 */
interface RequestConfig<TBody = unknown> extends Omit<
  RequestInit,
  "method" | "body" | "headers" | "signal"
> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal | null;
  timeout?: number;
}

type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
};

type ApiErrorResponse = {
  ok: false;
  error: {
    code: ApiErrorCode;
    data?: ApiErrorData;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isApiSuccessResponse<T>(body: unknown): body is ApiSuccessResponse<T> {
  return isRecord(body) && body.ok === true && "data" in body;
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (!isRecord(body) || body.ok !== false || !("error" in body)) {
    return false;
  }

  const error = body.error;

  if (!isRecord(error) || typeof error.code !== "string") {
    return false;
  }

  if ("data" in error && error.data !== undefined && !isRecord(error.data)) {
    return false;
  }

  return true;
}

async function handleResponse<T>(response: Response): Promise<T> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok) {
    if (isApiSuccessResponse<T>(body)) {
      return body.data;
    }

    return body as T;
  }

  if (isApiErrorResponse(body)) {
    throw new ApiError({
      code: body.error.code,
      status: response.status,
      data: body.error.data,
    });
  }

  if (response.status === 404) {
    throw new ApiError({
      code: "NOT_FOUND" as ApiErrorCode,
      status: 404,
    });
  }

  throw new ApiError({
    code: "EXTERNAL_SERVICE" as ApiErrorCode,
    status: response.status || 502,
  });
}

/**
 * Handles network errors and timeouts
 */
function handleNetworkError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    throw new ApiError({
      code: "NETWORK_TIMEOUT" as ApiErrorCode,
      status: 0,
    });
  }

  throw new ApiError({
    code: "NETWORK_ERROR" as ApiErrorCode,
    status: 0,
  });
}

/**
 * Creates an AbortController that auto-aborts after timeout
 */
function createTimeoutController(
  timeout: number,
  externalSignal?: AbortSignal | null,
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const abortListener = () => {
    controller.abort();
    clearTimeout(timeoutId);
  };

  if (externalSignal) {
    externalSignal.addEventListener("abort", abortListener);
  }

  return {
    controller,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener("abort", abortListener);
      }
    },
  };
}

/**
 * Main fetch function that replaces axios
 */
async function request<T, TBody = unknown>(
  endpoint: string,
  config: RequestConfig<TBody> = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers,
    signal,
    timeout = DEFAULT_TIMEOUT,
    ...rest
  } = config;

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const { controller, cleanup } = createTimeoutController(timeout, signal);

  const defaultHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData)) {
    defaultHeaders.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...rest,
    method,
    headers: defaultHeaders,
    credentials: "include",
    signal: controller.signal,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, fetchOptions);
    return await handleResponse<T>(response);
  } catch (error) {
    return handleNetworkError(error);
  } finally {
    cleanup();
  }
}

const fetchClient = {
  get: <T>(url: string, options?: FetchOptions) =>
    request<T>(url, { method: "GET", ...options }),

  post: <T, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: FetchOptions,
  ) => request<T, TBody>(url, { method: "POST", body, ...options }),

  put: <T, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: FetchOptions,
  ) => request<T, TBody>(url, { method: "PUT", body, ...options }),

  delete: <T>(url: string, options?: FetchOptions) =>
    request<T>(url, { method: "DELETE", ...options }),

  patch: <T, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: FetchOptions,
  ) => request<T, TBody>(url, { method: "PATCH", body, ...options }),
};

export default fetchClient;
