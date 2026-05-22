import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Sonner Toaster wrapper configured for the redesigned toast system.
 *
 * - Position: top-left (top-end in RTL layout)
 * - Maximum 3 toasts visible; oldest dismissed when 4th arrives
 * - Custom styling with design tokens
 *
 * Validates: Requirements 6.1, 6.5, 6.6
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-left"
      visibleToasts={3}
      gap={12}
      toastOptions={{
        unstyled: true,
        className: "w-full",
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
