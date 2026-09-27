// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "clay-btn-primary",
        // Give outline buttons the same solid clay pill treatment as primary:
        outline: "clay-btn-primary",
        secondary: "clay-btn-secondary",
        destructive: "bg-rose-600 text-white rounded-2xl shadow-[5px_7px_14px_rgba(225,29,72,0.4),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-3px_-3px_5px_rgba(136,19,55,0.4)] active:scale-95",
        ghost: "hover:bg-indigo-100/50 text-foreground rounded-xl transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 rounded-2xl",
        sm: "h-9 px-4 text-xs rounded-xl",
        lg: "h-13 px-8 rounded-2xl text-base",
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