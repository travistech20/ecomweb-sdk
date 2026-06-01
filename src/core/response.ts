import type { ApiResponse } from "./types";

export class ApiClientError extends Error {
  statusCode: number;
  code?: string;
  constructor(message: string, statusCode = 0, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function unwrap<T>(response: ApiResponse<T>): T {
  if (response.success && response.data !== undefined) {
    return response.data as T;
  }
  const message = response.error?.message || "Request failed";
  const status = response.error?.statusCode || 0;
  const code = response.error?.error;
  throw new ApiClientError(message, status, code);
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
  const message = response.error?.message || "Request failed";
  const status = response.error?.statusCode || 0;
  const code = response.error?.error;
  throw new ApiClientError(message, status, code);
}

export function ensureSuccess(response: ApiResponse<any>): void {
  if (response.success) return;
  const message = response.error?.message || "Request failed";
  const status = response.error?.statusCode || 0;
  const code = response.error?.error;
  throw new ApiClientError(message, status, code);
}
