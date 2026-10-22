export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "UNAVAILABLE"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  fields?: Record<string, string>;
  details?: unknown;
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly fields?: Record<string, string>;
  readonly details?: unknown;

  constructor(body: ApiErrorBody, status?: number) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.status = status;
    this.fields = body.fields;
    this.details = body.details;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function isUnauthorized(value: unknown): value is ApiError {
  return isApiError(value) && value.code === "UNAUTHORIZED";
}

export function isNotFound(value: unknown): value is ApiError {
  return isApiError(value) && value.code === "NOT_FOUND";
}

export function isConflict(value: unknown): value is ApiError {
  return isApiError(value) && value.code === "CONFLICT";
}

export function isIdempotencyConflict(value: unknown): value is ApiError {
  return isApiError(value) && value.code === "IDEMPOTENCY_CONFLICT";
}
