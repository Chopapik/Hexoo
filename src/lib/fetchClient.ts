import { ApiError } from "./AppError";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEFAULT_TIMEOUT = 10000;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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
interface RequestConfig<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  let body: any;

  try {
    body = await response.json();
  } catch {
    // Response is not JSON
    body = null;
  }

  // If response is OK (2xx status)
  if (response.ok) {
    // If the response has ok: true structure, return only the data
    if (body && typeof body === "object" && body.ok === true && "data" in body) {
      return body.data as T;
    }
    return body as T;
  }

  // Handle API logic errors (e.g. invalid password)
  // The backend sends structured error data
  if (body && typeof body === "object" && body.ok === false && body.error) {
    throw new ApiError({
      code: body.error.code,
      status: response.status,
      data: body.error.data,
    });
  }

  // Handle 404 error
  if (response.status === 404) {
    throw new ApiError({
      code: "NOT_FOUND",
      status: 404,
    });
  }

  // Handle other server errors
  throw new ApiError({
    code: "EXTERNAL_SERVICE",
    status: response.status ?? 502,
  });
}

/**
 * Handles network errors and timeouts
 */
function handleNetworkError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  // Check for abort/timeout
  if (error instanceof DOMException && error.name === "AbortError") {
    throw new ApiError({
      code: "NETWORK_TIMEOUT",
      status: 0,
    });
  }

  // Network error (no connection)
  throw new ApiError({
    code: "NETWORK_ERROR",
    status: 0,
  });
}

/**
 * Creates an AbortController that auto-aborts after timeout
 */
function createTimeoutController(
  timeout: number,
  externalSignal?: AbortSignal
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  // If external signal is provided, link it
  if (externalSignal) {
    externalSignal.addEventListener("abort", () => {
      controller.abort();
      clearTimeout(timeoutId);
    });
  }

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  };
}

/**
 * Main fetch function that replaces axios
 */
async function request<T, TBody = unknown>(
  endpoint: string,
  config: RequestConfig<TBody> = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, signal, timeout = DEFAULT_TIMEOUT } = config;

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const { controller, cleanup } = createTimeoutController(timeout, signal);

  const defaultHeaders: Record<string, string> = {};

  // Auto-set Content-Type for JSON bodies (not for FormData)
  if (body && !(body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: "include", // equivalent to withCredentials: true
    signal: controller.signal,
  };

  // Handle body
  if (body) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, fetchOptions);
    cleanup();
    return await handleResponse<T>(response);
  } catch (error) {
    cleanup();
    return handleNetworkError(error);
  }
}


const fetchClient = {
  get: <T>(url: string, options?: FetchOptions) =>
    request<T>(url, { method: "GET", ...options }),

  post: <T, TBody = unknown>(url: string, body?: TBody, options?: FetchOptions) =>
    request<T, TBody>(url, { method: "POST", body, ...options }),

  put: <T, TBody = unknown>(url: string, body?: TBody, options?: FetchOptions) =>
    request<T, TBody>(url, { method: "PUT", body, ...options }),

  delete: <T>(url: string, options?: FetchOptions) =>
    request<T>(url, { method: "DELETE", ...options }),

  patch: <T, TBody = unknown>(url: string, body?: TBody, options?: FetchOptions) =>
    request<T, TBody>(url, { method: "PATCH", body, ...options }),
};

export default fetchClient;
