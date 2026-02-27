"use client";

import { cn } from "@/lib/utils";

interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  className?: string;
}

export function ChartLine({
  data,
  color = "#0000FF",
  height = 160,
  className,
}: LineChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const padding = 10;
  const chartWidth = 100;
  const chartHeight = 100;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (chartWidth - padding * 2);
    const y =
      padding + (1 - (d.value - min) / range) * (chartHeight - padding * 2);
    return `${x},${y}`;
  });

  const fillPoints = [
    `${padding},${chartHeight - padding}`,
    ...points,
    `${chartWidth - padding},${chartHeight - padding}`,
  ].join(" ");

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <polygon
          points={fillPoints}
          fill={color}
          fillOpacity="0.06"
        />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x =
            padding + (i / (data.length - 1)) * (chartWidth - padding * 2);
          const y =
            padding +
            (1 - (d.value - min) / range) * (chartHeight - padding * 2);
          return (
            <circle key={i} cx={x} cy={y} r="1.5" fill={color} />
          );
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-text-tertiary">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
