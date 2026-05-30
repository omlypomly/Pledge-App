import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-600 text-white",
        secondary: "border-transparent bg-white/10 text-white/80",
        destructive: "border-transparent bg-red-600/80 text-white",
        outline: "border-white/20 text-white/70",
        success: "border-transparent bg-emerald-600/80 text-white",
        warning: "border-transparent bg-yellow-600/80 text-white",
        info: "border-transparent bg-blue-600/80 text-white",
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
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
