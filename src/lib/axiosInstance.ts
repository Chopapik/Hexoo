import axios from "axios";
import { ApiError } from "./ApiError";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Success interceptor: converts { ok: true, data } into res.data = data
axiosInstance.interceptors.response.use(
  (res) => {
    const body = res?.data;
    if (body && typeof body === "object") {
      // Backend returned structured error payload: { ok: false, error: { code, message, data?, details? } }
      if (body.ok === false && body.error) {
        const {
          code = "INTERNAL_ERROR",
          message = "Unknown error",
          details,
          data,
        } = body.error;

        // Use HTTP status from the response if present, otherwise fall back to 500
        const status = res?.status ?? 500;

        throw new ApiError({
          code: code as any,
          message,
          status,
          details,
          data,
        });
      }

      // Normalised success shape { ok: true, data: ... } -> return original response but with data replaced
      if (body.ok === true && "data" in body) {
        return { ...res, data: body.data };
      }
    }

    // If response body is not the structured envelope, return it as-is
    return res;
  },

  (error) => {
    // If the server responded with a structured body (4xx/5xx)
    const resp = error?.response;
    const respData = resp?.data;

    if (respData && typeof respData === "object") {
      // If backend used the { ok: false, error } envelope
      if (respData?.ok === false && respData?.error) {
        const {
          code = "INTERNAL_ERROR",
          message = "Unknown error",
          details,
          data,
          status: bodyStatus,
        } = respData.error;

        const status = resp?.status ?? bodyStatus ?? 500;

        throw new ApiError({
          code: code as any,
          message,
          status,
          details,
          data,
        });
      }

      // Non-enveloped structured error from upstream/external service
      throw new ApiError({
        code: "EXTERNAL_SERVICE",
        message: resp?.statusText || "External service error",
        status: resp?.status ?? 502,
        details: { raw: respData },
      });
    }

    // Timeout / network issue (axios uses code === 'ECONNABORTED' for timeouts)
    const isTimeout = error?.code === "ECONNABORTED";
    if (isTimeout) {
      throw new ApiError({
        code: "NETWORK_TIMEOUT",
        message: "Request timed out",
        status: 408,
        details: { originalError: safeSerialize(error) },
      });
    }

    // Generic network error or something else (no response)
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: error?.message ?? "Network error",
      status: 0,
      details: { originalError: safeSerialize(error) },
    });
  }
);

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
