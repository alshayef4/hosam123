import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { springToggle } from "@/lib/motion";

interface ThemeToggleProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
} as const;

const iconSizes = {
  sm: "size-4",
  md: "size-[18px]",
  lg: "size-5",
} as const;

export function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) return null;

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center
        ${sizeClasses[size]} rounded-full
        bg-transparent hover:bg-accent/80
        transition-colors duration-200
        focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2
        ${className}
      `}
      aria-label={
        theme === "dark" ? "التبديل للوضع الفاتح" : "التبديل للوضع الداكن"
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="flex items-center justify-center"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          exit={{ rotate: 180, scale: 0 }}
          transition={springToggle}
        >
          {theme === "dark" ? (
            <Sun className={`${iconSizes[size]} text-amber-400`} strokeWidth={1.5} />
          ) : (
            <Moon className={`${iconSizes[size]} text-indigo-500`} strokeWidth={1.5} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
