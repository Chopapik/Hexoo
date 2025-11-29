import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000,
  // headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Helper - wraps the error without creating class instances
function wrapError(payload: any) {
  return {
    isApiError: true,
    ...payload,
  };
}

// ---------------------
//   RESPONSE SUCCESS
// ---------------------
axiosInstance.interceptors.response.use(
  (res) => {
    const body = res?.data;

    if (body && typeof body === "object") {
      // Case: { ok: false, error: {...} }
      if (body.ok === false && body.error) {
        throw wrapError({
          code: body.error.code ?? "INTERNAL_ERROR",
          message: body.error.message ?? "Unknown error",
          status: res?.status ?? body.error.status ?? 500,
          details: body.error.details,
          data: body.error.data,
        });
      }

      // Case: { ok: true, data: ... }
      if (body.ok === true && "data" in body) {
        return { ...res, data: body.data };
      }
    }

    return res;
  },

  // ---------------------
  //   RESPONSE ERROR
  // ---------------------
  (error) => {
    const resp = error?.response;
    const respData = resp?.data;

    // 1. If the backend returned a standard ApiError JSON (even with a 404 status)
    if (respData && typeof respData === "object") {
      if (respData.ok === false && respData.error) {
        throw wrapError({
          code: respData.error.code ?? "INTERNAL_ERROR",
          message: respData.error.message ?? "Unknown error",
          status: resp?.status ?? respData.error.status ?? 500,
          details: respData.error.details,
          data: respData.error.data,
        });
      }
    }

    // 2. Handle specific HTTP 404 error (when JSON body is missing or empty) 🐤
    if (resp?.status === 404) {
      throw wrapError({
        code: "NOT_FOUND",
        message: "Resource not found (404)",
        status: 404,
        details: respData || "Endpoint does not exist",
      });
    }

    // 3. Any other structured error (without the ok: false flag) or HTML error response
    if (resp) {
      throw wrapError({
        code: "EXTERNAL_SERVICE",
        message: resp?.statusText || "External service error",
        status: resp?.status ?? 502,
        details: { raw: respData },
      });
    }

    // 4. Timeout handling
    if (error?.code === "ECONNABORTED") {
      throw wrapError({
        code: "NETWORK_TIMEOUT",
        message: "Request timed out",
        status: 408,
        details: safeSerialize(error),
      });
    }

    // 5. Generic network error (e.g., no internet connection)
    throw wrapError({
      code: "NETWORK_ERROR",
      message: error?.message ?? "Network error",
      status: 0,
      details: safeSerialize(error),
    });
  }
);

// ---------------------
function safeSerialize(err: any) {
  if (!err) return err;
  try {
    if (err instanceof Error) {
      return { message: err.message, name: err.name, stack: err.stack };
    }
    return JSON.parse(JSON.stringify(err));
  } catch {
    return String(err);
  }
}

export default axiosInstance;
