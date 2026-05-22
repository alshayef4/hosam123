import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  checkRateLimit,
  _resetStore,
  _getStoreSize,
  _cleanupExpiredEntries,
} from "./rateLimiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    _resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    it("allows the first request from an IP", () => {
      const result = checkRateLimit("192.168.1.1");
      expect(result).toEqual({ allowed: true });
    });

    it("allows up to 30 requests within the window", () => {
      for (let i = 0; i < 30; i++) {
        const result = checkRateLimit("192.168.1.1");
        expect(result.allowed).toBe(true);
      }
    });

    it("blocks the 31st request within the window", () => {
      for (let i = 0; i < 30; i++) {
        checkRateLimit("192.168.1.1");
      }
      const result = checkRateLimit("192.168.1.1");
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60);
    });

    it("returns retryAfter in seconds until window reset", () => {
      for (let i = 0; i < 30; i++) {
        checkRateLimit("192.168.1.1");
      }

      // Advance 30 seconds into the window
      vi.advanceTimersByTime(30_000);

      const result = checkRateLimit("192.168.1.1");
      expect(result.allowed).toBe(false);
      // Should be approximately 30 seconds remaining
      expect(result.retryAfter).toBeLessThanOrEqual(30);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("resets the window after 60 seconds", () => {
      for (let i = 0; i < 30; i++) {
        checkRateLimit("192.168.1.1");
      }

      // Advance past the window
      vi.advanceTimersByTime(60_001);

      const result = checkRateLimit("192.168.1.1");
      expect(result.allowed).toBe(true);
    });

    it("tracks different IPs independently", () => {
      for (let i = 0; i < 30; i++) {
        checkRateLimit("192.168.1.1");
      }

      // First IP is blocked
      expect(checkRateLimit("192.168.1.1").allowed).toBe(false);

      // Second IP is still allowed
      expect(checkRateLimit("192.168.1.2").allowed).toBe(true);
    });

    it("does not include retryAfter when allowed", () => {
      const result = checkRateLimit("192.168.1.1");
      expect(result.retryAfter).toBeUndefined();
    });
  });

  describe("cleanup", () => {
    it("removes expired entries after cleanup runs", () => {
      checkRateLimit("192.168.1.1");
      checkRateLimit("192.168.1.2");
      expect(_getStoreSize()).toBe(2);

      // Advance past the window expiry
      vi.advanceTimersByTime(60_001);

      // Manually trigger cleanup (simulates the periodic interval)
      _cleanupExpiredEntries();

      // After cleanup runs, expired entries should be removed
      expect(_getStoreSize()).toBe(0);
    });

    it("keeps active entries during cleanup", () => {
      checkRateLimit("192.168.1.1");

      // Advance 30 seconds (within window)
      vi.advanceTimersByTime(30_000);

      // Add a new IP (its window starts now, expires at 90s from start)
      checkRateLimit("192.168.1.2");

      // Advance to 60s+ from start (first IP expired, second still active)
      vi.advanceTimersByTime(30_001);

      // Manually trigger cleanup
      _cleanupExpiredEntries();

      // First IP's window has expired (60s passed), second IP is still active
      expect(_getStoreSize()).toBe(1);
    });
  });
});
