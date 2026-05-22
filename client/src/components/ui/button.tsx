import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 active:scale-[0.97] active:shadow-sm active:duration-100",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/20 active:translate-y-0 active:scale-[0.97] active:shadow-sm active:duration-100 focus-visible:ring-destructive/30",
        outline:
          "border-2 border-border bg-transparent shadow-xs hover:bg-accent/8 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.97] active:shadow-xs active:duration-100 dark:border-border dark:hover:bg-accent/10 dark:hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs border border-border/50 hover:bg-secondary/80 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 active:translate-y-0 active:scale-[0.97] active:shadow-xs active:duration-100",
        ghost:
          "hover:bg-accent/12 dark:hover:bg-accent/15 active:scale-[0.97] active:duration-100 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-3.5 text-xs has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-7 text-base has-[>svg]:px-5",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
