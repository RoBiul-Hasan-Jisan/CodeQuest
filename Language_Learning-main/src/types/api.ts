import type { ERROR_CODES } from "@/lib/constants";

// ─── API response envelope ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: keyof typeof ERROR_CODES;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Route handler helper types ──────────────────────────────────────────────

export function apiSuccess<T>(data: T, message?: string): ApiSuccess<T> {
  return { success: true, data, ...(message ? { message } : {}) };
}

export function apiError(
  code: keyof typeof ERROR_CODES,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  };
}
