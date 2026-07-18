import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Newspaper-style chip — used for category tags / section labels.
 * Sharp corners, ink border, uppercase tracked.
 */
const badgeVariants = cva(
  "inline-flex items-center font-ui font-medium uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border border-rule-soft/70 bg-paper-soft/80 text-ink hover:border-ink hover:bg-paper-warm",
        stamp: "border border-stamp/80 bg-paper text-stamp hover:bg-stamp hover:text-paper",
        ink: "bg-ink text-paper",
        soft: "bg-paper-warm text-ink border border-rule-soft/30",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-[11px]",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
