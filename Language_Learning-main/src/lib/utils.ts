import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to a readable string */
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

/** Format a number with commas */
export function formatNumber(n: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", options).format(n);
}

/** Truncate a string to a max length */
export function truncate(str: string, maxLength: number, suffix = "...") {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/** Sleep for a given number of milliseconds */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Assert that a value is never reached (exhaustive check) */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

/** Generate a random ID (client-side only, not cryptographically secure) */
export function generateId(length = 8) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}
