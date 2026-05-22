import { useMemo } from "react";
import type { Variants } from "framer-motion";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Hook for staggered entrance animations on lists, grids, and table rows.
 * Returns Framer Motion container and item variants with stagger delay.
 *
 * - Caps stagger at `maxStagger` items; items beyond appear immediately.
 * - Respects the user's reduced motion preference.
 *
 * Validates: Requirements 12.2
 */
export function useStaggerAnimation(
  itemCount: number,
  maxStagger: number = 20
): { containerVariants: Variants; itemVariants: Variants } {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        initial: {},
        animate: {},
      };
    }

    const cappedCount = Math.min(itemCount, maxStagger);

    return {
      initial: {},
      animate: {
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1,
          // Only stagger up to cappedCount items
          ...(cappedCount < itemCount && { staggerChildren: 0.05 }),
        },
      },
    };
  }, [itemCount, maxStagger, prefersReducedMotion]);

  const itemVariants = useMemo<Variants>(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
      };
    }

    return {
      initial: { opacity: 0, y: 8 },
      animate: (index: number) => ({
        opacity: 1,
        y: 0,
        transition:
          index < maxStagger
            ? { duration: 0.3, ease: "easeOut" }
            : { duration: 0 },
      }),
    };
  }, [maxStagger, prefersReducedMotion]);

  return { containerVariants, itemVariants };
}
