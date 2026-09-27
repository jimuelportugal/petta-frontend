// components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center clay-badge px-3 py-1 text-xs font-bold transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-rose-500/90 text-white",
        outline: "bg-muted/60 text-foreground border border-border/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };