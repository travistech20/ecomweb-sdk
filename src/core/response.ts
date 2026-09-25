import type { ApiResponse } from "./types";

export class ApiClientError extends Error {
  statusCode: number;
  code?: string;
  /** The business error's structured `details`, when the backend sent any. */
  details?: unknown;
  constructor(message: string, statusCode = 0, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function toClientError(response: ApiResponse<unknown>): ApiClientError {
  return new ApiClientError(
    response.error?.message || "Request failed",
    response.error?.statusCode || 0,
    response.error?.error,
    response.error?.details,
  );
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (response.success && response.data !== undefined) {
    return response.data as T;
  }
  throw toClientError(response);
}

export function unwrapOrNull<T>(
  response: ApiResponse<T>,
  nullStatusCodes: number[] = [404]
): T | null {
  if (response.success && response.data !== undefined) {
    return response.data as T;
  }
  if (
    !response.success &&
    response.error &&
    nullStatusCodes.includes(response.error.statusCode)
  ) {
    return null;
  }
  throw toClientError(response);
}

export function ensureSuccess(response: ApiResponse<any>): void {
  if (response.success) return;
  throw toClientError(response);
}
