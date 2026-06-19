/**
 * Simple in-memory sliding-window rate limiter.
 * Works for single-instance deployments (dev + small prod).
 * For multi-instance, swap the Map for Redis.
 */

interface Entry {
  timestamps: number[];
}

const store = new Map<string, Entry>();

// Prune entries older than 5 minutes every 10 minutes
setInterval(
  () => {
    const cutoff = Date.now() - 5 * 60_000;
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  },
  10 * 60_000
).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Seconds until the oldest request falls out of the window */
  retryAfterSeconds: number;
}

/**
 * @param identifier  Unique key — typically the client IP
 * @param limit       Max requests allowed in the window
 * @param windowMs    Window size in milliseconds (default 60 s)
 */
export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier) ?? { timestamps: [] };

  // Drop stale timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]!;
    const retryAfterMs = windowMs - (now - oldest);
    store.set(identifier, entry);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  store.set(identifier, entry);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}
