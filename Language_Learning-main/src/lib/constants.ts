export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Language Learning";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Firestore collection names — single source of truth */
export const COLLECTIONS = {
  USERS: "users",
  LESSONS: "lessons",
  VOCABULARY: "vocabulary",
  QUIZZES: "quizzes",
  PROGRESS: "progress",
  SESSIONS: "sessions",
} as const;

/** Firebase Storage bucket paths */
export const STORAGE_PATHS = {
  AVATARS: "avatars",
  AUDIO: "audio",
  IMAGES: "images",
} as const;

/** TanStack Query stale / cache times (milliseconds) */
export const QUERY_STALE_TIME = 1000 * 60 * 5; // 5 minutes
export const QUERY_CACHE_TIME = 1000 * 60 * 10; // 10 minutes

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 20;

/** Local storage keys */
export const STORAGE_KEYS = {
  THEME: "theme",
  LOCALE: "locale",
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
} as const;

/** API error codes */
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL: "INTERNAL",
  VALIDATION: "VALIDATION",
} as const;
