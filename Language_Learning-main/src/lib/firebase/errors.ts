import { FirebaseError } from "firebase/app";

/* ============================================================================
   Normalised Firebase error handling
   ============================================================================ */

export type AppErrorCode =
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "UNAVAILABLE"
  | "UNAUTHENTICATED"
  | "INVALID_ARGUMENT"
  | "RESOURCE_EXHAUSTED"
  | "ABORTED"
  | "STORAGE_LIMIT"
  | "NETWORK_ERROR"
  | "UNKNOWN";

/** Application-level error that wraps Firebase / network errors. */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly originalError?: unknown;

  constructor(message: string, code: AppErrorCode, originalError?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.originalError = originalError;
  }
}

/** Map Firebase error codes to user-friendly messages and AppErrorCodes. */
const FIREBASE_CODE_MAP: Record<string, { code: AppErrorCode; message: string }> = {
  "permission-denied":                  { code: "PERMISSION_DENIED",  message: "You don't have permission to perform this action." },
  "not-found":                          { code: "NOT_FOUND",          message: "The requested document was not found." },
  "already-exists":                     { code: "ALREADY_EXISTS",     message: "A document with this ID already exists." },
  "unavailable":                        { code: "UNAVAILABLE",        message: "The service is temporarily unavailable. Please try again." },
  "unauthenticated":                    { code: "UNAUTHENTICATED",    message: "You must be signed in to perform this action." },
  "invalid-argument":                   { code: "INVALID_ARGUMENT",   message: "Invalid data was provided." },
  "resource-exhausted":                 { code: "RESOURCE_EXHAUSTED", message: "You have exceeded your request quota. Please try again later." },
  "aborted":                            { code: "ABORTED",            message: "The operation was aborted. Please try again." },
  "storage/unauthorized":               { code: "PERMISSION_DENIED",  message: "You don't have permission to access this file." },
  "storage/object-not-found":           { code: "NOT_FOUND",          message: "The file was not found." },
  "storage/quota-exceeded":             { code: "STORAGE_LIMIT",      message: "Storage quota exceeded." },
  "storage/canceled":                   { code: "ABORTED",            message: "The file upload was cancelled." },
};

/**
 * Convert any thrown value into a typed `AppError`.
 * Safe to call inside React Query `queryFn` and `mutationFn`.
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof FirebaseError) {
    const mapped = FIREBASE_CODE_MAP[error.code];
    if (mapped) return new AppError(mapped.message, mapped.code, error);
    return new AppError(error.message || "A Firebase error occurred.", "UNKNOWN", error);
  }

  if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
    return new AppError("Network error — check your internet connection.", "NETWORK_ERROR", error);
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN", error);
  }

  return new AppError("An unexpected error occurred.", "UNKNOWN", error);
}

/** Type guard: is the error a "not found" error? */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof AppError && error.code === "NOT_FOUND";
}

/** Type guard: is the error a permission error? */
export function isPermissionError(error: unknown): boolean {
  return error instanceof AppError && error.code === "PERMISSION_DENIED";
}

/** Type guard: is the error an auth error? */
export function isAuthError(error: unknown): boolean {
  return error instanceof AppError && error.code === "UNAUTHENTICATED";
}
