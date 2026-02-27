"use client";

import { cn } from "@/lib/utils";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  className?: string;
}

export function ChartBar({ data, maxValue, height = 200, className }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("flex items-end gap-3", className)} style={{ height }}>
      {data.map((item, i) => {
        const barHeight = max > 0 ? (item.value / max) * 100 : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-[10px] font-semibold text-text-tertiary">
              {item.value}
            </span>
            <div className="w-full relative" style={{ height: `${height - 40}px` }}>
              <div
                className="absolute bottom-0 w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: item.color || "#BA55D3",
                }}
              />
            </div>
            <span className="text-[10px] text-text-tertiary truncate max-w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
