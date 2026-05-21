import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-line bg-soft text-ink-2",
        outline: "border-line bg-canvas text-ink-3",
        solid: "border-ink bg-ink text-canvas",
        approve:
          "border-approve-line bg-approve-bg text-approve",
        reject:
          "border-reject-line bg-reject-bg text-reject",
        focus:
          "border-focus-line bg-focus-bg text-focus",
        accent:
          "border-accent-line bg-accent-bg text-accent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
