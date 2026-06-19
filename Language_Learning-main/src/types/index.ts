// ─── Common utility types ────────────────────────────────────────────────────

/** Make specific keys optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make specific keys required */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Deeply partial type */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/** Non-nullable type */
export type NonNullableFields<T> = { [K in keyof T]: NonNullable<T[K]> };

/** Extract the resolved type from a Promise */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Sort & filter ───────────────────────────────────────────────────────────

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

// ─── Common entity base ──────────────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Status ──────────────────────────────────────────────────────────────────

export type Status = "idle" | "loading" | "success" | "error";
