import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "clay-btn-primary text-white",
        destructive: "bg-rose-500 text-white rounded-2xl shadow-[4px_4px_10px_rgba(244,63,94,0.35),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-3px_-3px_5px_rgba(0,0,0,0.25)] active:scale-95",
        outline: "clay-btn-secondary text-foreground hover:text-primary",
        secondary: "clay-btn-secondary text-foreground",
        ghost: "hover:bg-accent/40 rounded-xl transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-2xl",
        sm: "h-8 px-3.5 text-xs rounded-xl",
        lg: "h-12 px-7 rounded-2xl text-base",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
