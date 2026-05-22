import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 border-transparent shadow-sm cursor-pointer transition-all duration-300 ease-out outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600 data-[state=checked]:shadow-emerald-500/25 data-[state=checked]:shadow-md",
        "data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700",
        "hover:data-[state=unchecked]:bg-gray-300 dark:hover:data-[state=unchecked]:bg-gray-600",
        "hover:data-[state=checked]:shadow-lg hover:data-[state=checked]:shadow-emerald-500/30",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4.5 rounded-full bg-white shadow-md ring-0 transition-all duration-300 ease-out",
          "data-[state=checked]:translate-x-[calc(100%+1px)]",
          "data-[state=unchecked]:translate-x-0.5",
          "data-[state=checked]:shadow-lg",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
