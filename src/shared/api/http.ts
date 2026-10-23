import axios, { AxiosError, type AxiosInstance } from "axios";
import { env } from "@/shared/lib/env";
import { getToken, clearAuth } from "@/shared/lib/auth-store";
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
  if (error.code === "ECONNABORTED") {
    return new ApiError({ code: "TIMEOUT", message: "Request timed out." });
  }
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

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = normalizeError(error);

    if (apiError.code === "UNAUTHORIZED") {
      clearAuth();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(apiError);
  },
);
