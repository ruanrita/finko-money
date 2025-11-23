import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-foreground text-background hover:bg-foreground/90":
            variant === "default",
          "bg-muted text-foreground hover:bg-muted/80":
            variant === "secondary",
          "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100":
            variant === "success",
          "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100":
            variant === "destructive",
          "border border-border bg-card text-card-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
