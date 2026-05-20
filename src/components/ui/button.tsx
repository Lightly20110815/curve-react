import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Newspaper-edition buttons.
 *
 * - default → "INK" — solid ink black with paper text (most CTAs)
 * - secondary → bordered paper button (lighter actions)
 * - stamp → vintage red stamp button (rare emphasis)
 * - ghost → text link with bottom border
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium",
    "transition-colors duration-150 select-none uppercase",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    "disabled:pointer-events-none disabled:opacity-60",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:bg-stamp",
        secondary: "border border-ink text-ink bg-transparent hover:bg-ink hover:text-paper",
        stamp: "bg-stamp text-paper hover:bg-ink",
        ghost:
          "bg-transparent text-ink border-b border-ink rounded-none px-0 hover:border-stamp hover:text-stamp",
      },
      size: {
        sm: "h-8 px-3 text-[11px]",
        md: "h-10 px-5 text-[12px]",
        lg: "h-12 px-7 text-[13px]",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
