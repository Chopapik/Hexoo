import axios from "axios";
import { ApiError } from "./AppError";

// Create Axios instance with basic settings
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  (res) => {
    const body = res?.data;

    // If the response is correct (ok: true), return only the data
    if (
      body &&
      typeof body === "object" &&
      body.ok === true &&
      "data" in body
    ) {
      return { ...res, data: body.data };
    }
    return res;
  },
  (error) => {
    const resp = error?.response;
    const respData = resp?.data;

    // 1. Handle API logic errors (e.g. invalid password)
    // The backend sends structured error data
    if (
      respData &&
      typeof respData === "object" &&
      respData.ok === false &&
      respData.error
    ) {
      throw new ApiError({
        code: respData.error.code,
        status: resp?.status,
        data: respData.error.data,
        // The message is generated automatically by ApiError class
      });
    }

    // 2. Handle 404 error (Page or resource not found)
    if (resp?.status === 404) {
      throw new ApiError({
        code: "NOT_FOUND",
        status: 404,
      });
    }

    // 3. Handle other server errors (e.g. 500 Internal Server Error)
    if (resp) {
      throw new ApiError({
        code: "EXTERNAL_SERVICE",
        status: resp?.status ?? 502,
      });
    }

    // 4. Handle network issues (timeout or no internet connection)
    const code =
      error?.code === "ECONNABORTED" ? "NETWORK_TIMEOUT" : "NETWORK_ERROR";
    throw new ApiError({
      code: code,
      status: 0,
    });
  }
);

export default axiosInstance;
