import type { Variants, Transition } from "framer-motion";

/**
 * Page transition variants.
 * Fade + 10px y-translate, 400ms ease-out.
 * Validates: Requirements 12.1
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

/**
 * Page transition timing config.
 * 400ms with custom ease-out curve matching design token --ease-out.
 * Validates: Requirements 12.1
 */
export const pageTransitionConfig: Transition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
};

/**
 * Stagger container variants.
 * 50ms delay between items, 100ms initial delay before first child.
 * Validates: Requirements 12.2
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

/**
 * Stagger item variants.
 * Fade + 8px y-translate, 300ms ease-out per item.
 * Validates: Requirements 12.2
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/**
 * Dialog variants.
 * Open: scale 0.95→1, 200ms ease-out.
 * Close: scale 1→0.95, 150ms ease-in.
 * Validates: Requirements 5.1, 5.2
 */
export const dialogVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/**
 * Spring toggle transition config.
 * Used for theme switch, sidebar collapse, and other toggle interactions.
 * Validates: Requirements 12.3
 */
export const springToggle: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

/**
 * Toast notification variants.
 * Slide-in from 20px offset with fade, 300ms ease-out.
 * Dismiss: slide out to 20px offset, 200ms ease-in.
 * Validates: Requirements 6.2
 */
export const toastVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};
