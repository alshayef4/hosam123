import { useState, useEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Hook that listens to the `prefers-reduced-motion` media query
 * and returns a boolean indicating whether reduced motion is preferred.
 * Updates live when the user changes their OS-level motion preference.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return window.matchMedia(REDUCED_MOTION_QUERY).matches;
    }
  );

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mql.addEventListener("change", onChange);
    setPrefersReducedMotion(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}
