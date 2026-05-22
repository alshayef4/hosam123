/**
 * IP-based sliding window rate limiter.
 *
 * Tracks mutation requests per IP in a 60-second sliding window.
 * Allows max 30 mutations per IP per window.
 * Periodically cleans up expired entries to prevent memory leaks.
 *
 * Requirements: 13.3, 13.7
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const MAX_REQUESTS = 30;
const WINDOW_MS = 60_000; // 60 seconds
const CLEANUP_INTERVAL_MS = 60_000; // Run cleanup every 60 seconds

// ─── Types ───────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const store = new Map<string, RateLimitEntry>();

// ─── Core Function ───────────────────────────────────────────────────────────

/**
 * Check whether a given IP is allowed to make a mutation request.
 *
 * Uses a sliding window approach: each IP gets a 60-second window starting
 * from their first request. If they exceed 30 requests within that window,
 * subsequent requests are denied until the window resets.
 *
 * @param ip - The client IP address
 * @returns `{ allowed: true }` if under limit, or `{ allowed: false, retryAfter: seconds }` if over limit
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  // No existing entry or window has expired — start a new window
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  // Window is still active — check if limit exceeded
  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Under limit — increment and allow
  entry.count++;
  return { allowed: true };
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

/**
 * Remove expired entries from the store to prevent memory leaks.
 * Called periodically via setInterval.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  store.forEach((entry, ip) => {
    if (now > entry.resetAt) {
      store.delete(ip);
    }
  });
}

// Start periodic cleanup (runs every 60 seconds)
const cleanupTimer = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);

// Allow the process to exit cleanly without waiting for the timer
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

// ─── Testing Utilities ───────────────────────────────────────────────────────

/** Reset the store (for testing purposes only) */
export function _resetStore(): void {
  store.clear();
}

/** Get current store size (for testing purposes only) */
export function _getStoreSize(): number {
  return store.size;
}

/** Manually trigger cleanup (for testing purposes only) */
export function _cleanupExpiredEntries(): void {
  cleanupExpiredEntries();
}
