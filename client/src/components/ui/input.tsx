import { useDialogComposition } from "@/components/ui/dialog";
import { useComposition } from "@/hooks/useComposition";
import { cn } from "@/lib/utils";
import * as React from "react";

function Input({
  className,
  type,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  ...props
}: React.ComponentProps<"input">) {
  // Get dialog composition context if available (will be no-op if not inside Dialog)
  const dialogComposition = useDialogComposition();

  // Add composition event handlers to support input method editor (IME) for CJK languages.
  const {
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  } = useComposition<HTMLInputElement>({
    onKeyDown: e => {
      // Check if this is an Enter key that should be blocked
      const isComposing =
        (e.nativeEvent as any).isComposing ||
        dialogComposition.justEndedComposing();

      // If Enter key is pressed while composing or just after composition ended,
      // don't call the user's onKeyDown (this blocks the business logic)
      if (e.key === "Enter" && isComposing) {
        return;
      }

      // Otherwise, call the user's onKeyDown
      onKeyDown?.(e);
    },
    onCompositionStart: e => {
      dialogComposition.setComposing(true);
      onCompositionStart?.(e);
    },
    onCompositionEnd: e => {
      // Mark that composition just ended - this helps handle the Enter key that confirms input
      dialogComposition.markCompositionEnd();
      // Delay setting composing to false to handle Safari's event order
      // In Safari, compositionEnd fires before the ESC keydown event
      setTimeout(() => {
        dialogComposition.setComposing(false);
      }, 100);
      onCompositionEnd?.(e);
    },
  });

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base: height, padding (logical properties for RTL), border, radius, background
        "h-9 w-full min-w-0 rounded-[var(--radius-md)] border border-border bg-transparent ps-3 pe-3 py-2 text-base shadow-xs outline-none md:text-sm",
        // Dark mode background
        "dark:bg-input/30",
        // Transitions: animate border/ring between valid/invalid states (200ms)
        "transition-all duration-200",
        // Focus state: primary ring color, 3px ring at 50% opacity
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        // Invalid state: destructive border, 3px ring at 20% (40% dark), tinted background at 5%
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-destructive/20 dark:aria-[invalid=true]:ring-destructive/40 aria-[invalid=true]:bg-destructive/5",
        // Placeholder: muted-foreground at 0.7 opacity
        "placeholder:text-muted-foreground/70",
        // Selection
        "selection:bg-primary selection:text-primary-foreground",
        // Disabled: 50% opacity, not-allowed cursor, no pointer events
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        // File input styling
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

export { Input };
