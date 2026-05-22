import { motion, useReducedMotion } from "framer-motion";
import { Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

/**
 * Centered empty state placeholder with 64px icon inside a gradient circle,
 * improved typography, fade-in animation, and prominent action button.
 * Framer Motion fade-in animation respects prefers-reduced-motion.
 * RTL-compatible via logical properties.
 *
 * Validates: Requirements 9.4
 */
export function EmptyState({
  message,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[340px] gap-8 p-8 text-center"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {/* 64px icon with gradient background circle */}
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 shadow-sm">
        <Icon
          className="size-16 text-primary/60 dark:text-primary/70"
          strokeWidth={1.2}
          aria-hidden="true"
        />
      </div>

      {/* Message with better typography */}
      <p className="text-lg text-muted-foreground max-w-sm leading-relaxed font-medium">
        {message}
      </p>

      {/* Prominent action button */}
      {actionLabel && onAction && (
        <Button
          variant="default"
          size="lg"
          onClick={onAction}
          className="bg-gradient-primary text-white shadow-glow-sm hover:shadow-glow transition-all duration-200 hover:scale-[1.03] active:scale-95 rounded-xl px-8"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
