import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm [a&]:hover:shadow-md [a&]:hover:scale-105",
        secondary:
          "border-border/50 bg-secondary/80 text-secondary-foreground [a&]:hover:bg-secondary [a&]:hover:border-border",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm [a&]:hover:shadow-md [a&]:hover:scale-105 focus-visible:ring-destructive/30",
        outline:
          "border-border/60 text-foreground bg-transparent [a&]:hover:bg-accent/10 [a&]:hover:border-primary/40 [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20",
        info:
          "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
