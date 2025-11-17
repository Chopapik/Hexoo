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
      if (body.ok === false && body.error) {
        const {
          code = "INTERNAL_ERROR",
          message = "Unknown error",
          details,
        } = body.error;

        throw new ApiError(message, {
          status: res.status ?? 500,
          code: code as any,
          details,
          level: "error",
        });
      }

      if (body.ok === true && "data" in body) {
        // Return the original AxiosResponse, but replace data with body.data
        return { ...res, data: body.data };
      }
    }
    return res;
  },

  (error) => {
    // If the server responded with a 4xx/5xx error
    if (error?.response?.data) {
      const body = error.response.data;

      if (body?.ok === false && body?.error) {
        const {
          code = "INTERNAL_ERROR",
          message = "Unknown error",
          details,
        } = body.error;

        throw new ApiError(message, {
          status: 400,
          code,
          details,
          level: "error",
        });
      }

      // External service or other structured server error
      throw new ApiError(error.response.statusText || "External error", {
        status: error.response.status || 502,
        code: "EXTERNAL_SERVICE",
        details: { raw: body },
        level: "error",
      });
    }

    // Timeout / network issue
    const isTimeout = error?.code === "ECONNABORTED";
    if (isTimeout) {
      throw new ApiError("Request timed out", {
        status: 408,
        code: "NETWORK_TIMEOUT",
        level: "warn",
      });
    }

    // Generic network error
    throw new ApiError(error?.message ?? "Network error", {
      status: 0,
      code: "NETWORK_ERROR",
      level: "warn",
    });
  }
);

export default axiosInstance;
