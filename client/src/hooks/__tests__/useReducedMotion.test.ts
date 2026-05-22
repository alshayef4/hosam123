import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "../useReducedMotion";

describe("useReducedMotion", () => {
  let listeners: Map<string, (event: MediaQueryListEvent) => void>;
  let matchesValue: boolean;

  beforeEach(() => {
    listeners = new Map();
    matchesValue = false;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matchesValue,
        media: query,
        addEventListener: (
          event: string,
          handler: (event: MediaQueryListEvent) => void
        ) => {
          listeners.set(event, handler);
        },
        removeEventListener: (event: string) => {
          listeners.delete(event);
        },
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when prefers-reduced-motion is not set", () => {
    matchesValue = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it("returns true when prefers-reduced-motion is enabled", () => {
    matchesValue = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when media query changes from false to true", () => {
    matchesValue = false;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      const handler = listeners.get("change");
      if (handler) {
        handler({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);
  });

  it("updates when media query changes from true to false", () => {
    matchesValue = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);

    // Simulate media query change
    act(() => {
      const handler = listeners.get("change");
      if (handler) {
        handler({ matches: false } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(false);
  });

  it("cleans up event listener on unmount", () => {
    matchesValue = false;
    const { unmount } = renderHook(() => useReducedMotion());

    expect(listeners.has("change")).toBe(true);
    unmount();
    expect(listeners.has("change")).toBe(false);
  });
});
