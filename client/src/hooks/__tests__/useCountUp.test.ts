import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountUp } from "../useCountUp";

describe("useCountUp", () => {
  let matchesValue: boolean;

  beforeEach(() => {
    matchesValue = false;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matchesValue,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts at 0 and animates toward target value", () => {
    let frameCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frameCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { result } = renderHook(() => useCountUp(100, 500));

    // After first frame at time 0 (start), value should be 0
    // The hook requests animation frame, simulate partial progress
    expect(frameCallback).not.toBeNull();

    // Simulate frame at 50% progress (250ms into 500ms duration)
    const startTime = performance.now();
    vi.spyOn(performance, "now").mockReturnValue(startTime + 250);

    act(() => {
      if (frameCallback) frameCallback(startTime + 250);
    });

    // At 50% progress with ease-out cubic: 1 - (1 - 0.5)^3 = 1 - 0.125 = 0.875
    // Value should be Math.round(0 + (100 - 0) * 0.875) = 88
    expect(result.current).toBe(88);
  });

  it("reaches target value at end of animation", () => {
    let frameCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frameCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { result } = renderHook(() => useCountUp(100, 500));

    // Simulate frame at 100% progress (500ms)
    const startTime = performance.now();
    vi.spyOn(performance, "now").mockReturnValue(startTime + 500);

    act(() => {
      if (frameCallback) frameCallback(startTime + 500);
    });

    expect(result.current).toBe(100);
  });

  it("skips animation when reduced motion is enabled", () => {
    matchesValue = true;

    const { result } = renderHook(() => useCountUp(100, 500));

    // Should immediately show target value without animation
    expect(result.current).toBe(100);
  });

  it("uses ease-out cubic interpolation", () => {
    let frameCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frameCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { result } = renderHook(() => useCountUp(1000, 1000));

    const startTime = performance.now();

    // At 25% progress: easeOutCubic(0.25) = 1 - (1 - 0.25)^3 = 1 - 0.421875 = 0.578125
    vi.spyOn(performance, "now").mockReturnValue(startTime + 250);
    act(() => {
      if (frameCallback) frameCallback(startTime + 250);
    });
    expect(result.current).toBe(Math.round(1000 * 0.578125)); // 578

    // At 75% progress: easeOutCubic(0.75) = 1 - (1 - 0.75)^3 = 1 - 0.015625 = 0.984375
    vi.spyOn(performance, "now").mockReturnValue(startTime + 750);
    act(() => {
      if (frameCallback) frameCallback(startTime + 750);
    });
    expect(result.current).toBe(Math.round(1000 * 0.984375)); // 984
  });

  it("uses default duration of 500ms", () => {
    let frameCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frameCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { result } = renderHook(() => useCountUp(200));

    const startTime = performance.now();

    // At 500ms (default duration), should reach target
    vi.spyOn(performance, "now").mockReturnValue(startTime + 500);
    act(() => {
      if (frameCallback) frameCallback(startTime + 500);
    });
    expect(result.current).toBe(200);
  });

  it("cancels previous animation when target changes", () => {
    const cancelSpy = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);

    const { rerender } = renderHook(
      ({ target }) => useCountUp(target, 500),
      { initialProps: { target: 100 } }
    );

    // Change target - should cancel previous animation
    rerender({ target: 200 });

    expect(cancelSpy).toHaveBeenCalled();
  });

  it("handles target of 0", () => {
    matchesValue = true; // Skip animation for simplicity
    const { result } = renderHook(() => useCountUp(0, 500));
    expect(result.current).toBe(0);
  });
});
