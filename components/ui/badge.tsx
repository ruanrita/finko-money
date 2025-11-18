import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        {
          "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900":
            variant === "default",
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50":
            variant === "secondary",
          "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100":
            variant === "success",
          "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100":
            variant === "destructive",
          "border border-zinc-200 dark:border-zinc-800": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
