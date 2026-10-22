import axios, { AxiosError, type AxiosInstance } from "axios";
import { env } from "@/shared/lib/env";
import { ApiError, type ApiErrorBody, type ApiErrorCode } from "./errors";

function mapStatusToCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "VALIDATION_ERROR";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 429:
      return "RATE_LIMITED";
    case 503:
      return "UNAVAILABLE";
    default:
      return "UNKNOWN";
  }
}

function normalizeError(error: AxiosError): ApiError {
  // Timeout
  if (error.code === "ECONNABORTED") {
    return new ApiError({ code: "TIMEOUT", message: "Request timed out." });
  }

  // No response
  if (!error.response) {
    return new ApiError({ code: "NETWORK_ERROR", message: "Network error." });
  }

  const { status, data } = error.response;
  const body = data as Partial<ApiErrorBody> | undefined;

  return new ApiError(
    {
      code: body?.code ?? mapStatusToCode(status),
      message: body?.message ?? `Request failed with status ${status}.`,
      fields: body?.fields,
      details: body?.details,
    },
    status,
  );
}

export const http: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Request interceptor
http.interceptors.request.use((config) => {
  return config;
});

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = normalizeError(error);

    // window.dispatchEvent(new CustomEvent("auth:unauthorized"));

    return Promise.reject(apiError);
  },
);
