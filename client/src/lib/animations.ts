import type { Variants } from "framer-motion";

/**
 * Page transition animation preset.
 * Fade + vertical slide (10px) over 300ms ease-out.
 * Validates: Requirements 9.1
 */
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

/**
 * Stagger container for list animations.
 * Each child is delayed by 50ms.
 * Validates: Requirements 9.2
 */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

/**
 * Stagger item animation preset.
 * Fade + vertical slide (10px) over 300ms.
 * Validates: Requirements 9.2
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * Card hover animation preset.
 * Scale to 1.02 + elevated shadow over 200ms.
 * Validates: Requirements 9.3
 */
export const cardHover = {
  whileHover: { scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  transition: { duration: 0.2 },
};

/**
 * Dialog open/close animation preset.
 * Scale 0.95→1 + fade in over 200ms; reverse over 150ms on exit.
 * Validates: Requirements 9.4
 */
export const dialogAnimation = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
};

/**
 * Reduced motion variant for users with prefers-reduced-motion: reduce.
 * Disables transform-based animations; only opacity with max 100ms duration.
 * Validates: Requirements 9.6
 */
export const reducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
};
