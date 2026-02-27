import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "salmon" | "orchid" | "blue" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[rgba(0,0,0,0.06)] text-text-tertiary",
  salmon: "bg-[rgba(255,160,122,0.12)] text-[#cc6644]",
  orchid: "bg-[rgba(186,85,211,0.08)] text-orchid",
  blue: "bg-[rgba(0,0,255,0.06)] text-blue",
  success: "bg-[rgba(34,197,94,0.1)] text-green-600",
  warning: "bg-[rgba(234,179,8,0.1)] text-yellow-600",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-pill text-[11px] font-semibold tracking-[0.08em] uppercase",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
