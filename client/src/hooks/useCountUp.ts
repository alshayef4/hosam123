import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Ease-out cubic interpolation: 1 - (1 - t)^3
 * Starts fast, decelerates toward the end.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Hook that animates a number from its previous value to a target value
 * using ease-out interpolation. Respects reduced motion preference.
 *
 * @param target - The target number to animate toward
 * @param duration - Animation duration in milliseconds (default 500ms)
 * @returns The current animated number value (rounded to integer)
 */
export function useCountUp(target: number, duration: number = 500): number {
  const prefersReducedMotion = useReducedMotion();
  const [current, setCurrent] = useState<number>(target);
  const previousValueRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip animation when reduced motion is enabled
    if (prefersReducedMotion) {
      setCurrent(target);
      previousValueRef.current = target;
      return;
    }

    const startValue = previousValueRef.current;
    const startTime = performance.now();

    // Cancel any in-progress animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const value = startValue + (target - startValue) * easedProgress;
      setCurrent(Math.round(value));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
        previousValueRef.current = target;
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [target, duration, prefersReducedMotion]);

  return current;
}
