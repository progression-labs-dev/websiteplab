"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  barColor?: "salmon" | "orchid" | "blue" | "black";
  barPercent?: number;
  className?: string;
}

const barColors = {
  salmon: "bg-salmon",
  orchid: "bg-orchid",
  blue: "bg-blue",
  black: "bg-black",
};

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  barColor = "salmon",
  barPercent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-5",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-text-tertiary mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-[22px] font-semibold tracking-[-0.03em] text-black">
          {value}
        </p>
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-green-600",
              changeType === "negative" && "text-red-500",
              changeType === "neutral" && "text-text-tertiary"
            )}
          >
            {change}
          </span>
        )}
      </div>
      {barPercent !== undefined && (
        <div className="h-1 bg-[rgba(0,0,0,0.06)] rounded-full mt-3 overflow-hidden">
          <div
            className={cn("h-full rounded-full", barColors[barColor])}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
