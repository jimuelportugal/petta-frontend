// components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center clay-badge px-3 py-1 text-xs font-bold transition-all select-none",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white",
        secondary: "clay-badge",
        destructive: "bg-rose-500 text-white shadow-[2px_2px_6px_rgba(244,63,94,0.3)]",
        outline: "clay-badge",
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