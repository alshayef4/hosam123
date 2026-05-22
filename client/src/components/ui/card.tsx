import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border border-border/50 py-6 shadow-sm",
        "dark:bg-[oklch(0.12_0.018_264/0.8)] dark:backdrop-blur-sm dark:border-border/30",
        "transition-colors duration-300 ease-out",
        className
      )}
      {...props}
    />
  );
}

function CardInteractive({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      data-interactive
      className={cn(
        "group bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border border-border/50 py-6 shadow-sm",
        "dark:bg-[oklch(0.12_0.018_264/0.8)] dark:backdrop-blur-sm dark:border-border/30",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-[3px] hover:shadow-md hover:border-accent/40",
        "focus-within:-translate-y-[3px] focus-within:shadow-md focus-within:border-accent/40",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-6 pt-5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

interface CardKPIProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
}

function CardKPI({
  className,
  icon,
  value,
  label,
  ...props
}: CardKPIProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group relative bg-card text-card-foreground flex flex-col gap-3 rounded-2xl border border-border/50 py-6 shadow-sm overflow-hidden",
        "dark:bg-[oklch(0.12_0.018_264/0.8)] dark:backdrop-blur-sm dark:border-border/30",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-[3px] hover:shadow-md hover:border-accent/40",
        className
      )}
      {...props}
    >
      {/* Gradient accent bar at top */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-accent"
      />
      <div className="px-6 flex flex-col gap-2">
        {icon && (
          <div className="text-accent">{icon}</div>
        )}
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export {
  Card,
  CardInteractive,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardKPI,
};
