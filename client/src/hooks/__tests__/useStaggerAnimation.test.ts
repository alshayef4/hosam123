import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStaggerAnimation } from "../useStaggerAnimation";

describe("useStaggerAnimation", () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns containerVariants and itemVariants", () => {
    const { result } = renderHook(() => useStaggerAnimation(5));
    expect(result.current).toHaveProperty("containerVariants");
    expect(result.current).toHaveProperty("itemVariants");
  });

  it("containerVariants has initial and animate states", () => {
    const { result } = renderHook(() => useStaggerAnimation(5));
    expect(result.current.containerVariants).toHaveProperty("initial");
    expect(result.current.containerVariants).toHaveProperty("animate");
  });

  it("itemVariants has initial and animate states", () => {
    const { result } = renderHook(() => useStaggerAnimation(5));
    expect(result.current.itemVariants).toHaveProperty("initial");
    expect(result.current.itemVariants).toHaveProperty("animate");
  });

  it("containerVariants.animate includes staggerChildren transition", () => {
    const { result } = renderHook(() => useStaggerAnimation(10));
    const animate = result.current.containerVariants.animate as Record<
      string,
      unknown
    >;
    const transition = animate.transition as Record<string, unknown>;
    expect(transition.staggerChildren).toBe(0.05);
    expect(transition.delayChildren).toBe(0.1);
  });

  it("itemVariants.animate function returns duration 0 for items beyond maxStagger", () => {
    const { result } = renderHook(() => useStaggerAnimation(30, 20));
    const animateFn = result.current.itemVariants.animate as (
      index: number
    ) => Record<string, unknown>;

    // Item within maxStagger range should have normal duration
    const withinRange = animateFn(5);
    expect(withinRange.opacity).toBe(1);
    expect(withinRange.y).toBe(0);
    const withinTransition = withinRange.transition as Record<string, unknown>;
    expect(withinTransition.duration).toBe(0.3);

    // Item beyond maxStagger should have duration 0 (appear immediately)
    const beyondRange = animateFn(25);
    expect(beyondRange.opacity).toBe(1);
    expect(beyondRange.y).toBe(0);
    const beyondTransition = beyondRange.transition as Record<string, unknown>;
    expect(beyondTransition.duration).toBe(0);
  });

  it("caps stagger at default maxStagger of 20", () => {
    const { result } = renderHook(() => useStaggerAnimation(50));
    const animateFn = result.current.itemVariants.animate as (
      index: number
    ) => Record<string, unknown>;

    // Index 19 (last within default maxStagger=20) should animate normally
    const lastAnimated = animateFn(19);
    const lastTransition = lastAnimated.transition as Record<string, unknown>;
    expect(lastTransition.duration).toBe(0.3);

    // Index 20 (first beyond maxStagger) should appear immediately
    const firstImmediate = animateFn(20);
    const immediateTransition = firstImmediate.transition as Record<
      string,
      unknown
    >;
    expect(immediateTransition.duration).toBe(0);
  });

  it("respects custom maxStagger value", () => {
    const { result } = renderHook(() => useStaggerAnimation(15, 5));
    const animateFn = result.current.itemVariants.animate as (
      index: number
    ) => Record<string, unknown>;

    // Index 4 (last within maxStagger=5) should animate
    const lastAnimated = animateFn(4);
    const lastTransition = lastAnimated.transition as Record<string, unknown>;
    expect(lastTransition.duration).toBe(0.3);

    // Index 5 (first beyond maxStagger=5) should appear immediately
    const firstImmediate = animateFn(5);
    const immediateTransition = firstImmediate.transition as Record<
      string,
      unknown
    >;
    expect(immediateTransition.duration).toBe(0);
  });

  it("disables animations when reduced motion is preferred", () => {
    matchesValue = true;
    const { result } = renderHook(() => useStaggerAnimation(10));

    // Container should have empty variants
    expect(result.current.containerVariants.initial).toEqual({});
    expect(result.current.containerVariants.animate).toEqual({});

    // Item should show immediately (opacity 1, y 0)
    expect(result.current.itemVariants.initial).toEqual({ opacity: 1, y: 0 });
    expect(result.current.itemVariants.animate).toEqual({ opacity: 1, y: 0 });
  });

  it("itemVariants.initial has opacity 0 and y offset when motion is enabled", () => {
    matchesValue = false;
    const { result } = renderHook(() => useStaggerAnimation(5));
    expect(result.current.itemVariants.initial).toEqual({ opacity: 0, y: 8 });
  });
});
