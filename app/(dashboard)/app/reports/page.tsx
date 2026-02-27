"use client";

import { StatCard } from "@/components/ui/stat-card";
import { ChartBar } from "@/components/ui/chart-bar";
import { ChartLine } from "@/components/ui/chart-line";
import {
  overviewMetrics,
  revenueByService,
  monthlyRevenue,
  clientSatisfaction,
  q1Summary,
} from "@/lib/data/reports";

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-medium tracking-[-0.03em] mb-1">
          Reports
        </h2>
        <p className="text-sm text-text-tertiary">
          Performance analytics and quarterly insights
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {overviewMetrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Revenue by service */}
        <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-6">
          <h3 className="text-sm font-semibold tracking-[-0.01em] mb-1">
            Revenue by Service (Q1 2026)
          </h3>
          <p className="text-xs text-text-tertiary mb-6">
            In thousands USD
          </p>
          <ChartBar data={revenueByService} height={220} />
        </div>

        {/* Monthly revenue trend */}
        <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-6">
          <h3 className="text-sm font-semibold tracking-[-0.01em] mb-1">
            Monthly Revenue Trend
          </h3>
          <p className="text-xs text-text-tertiary mb-6">
            Last 5 months, in thousands USD
          </p>
          <ChartLine data={monthlyRevenue} color="#BA55D3" height={200} />
        </div>
      </div>

      {/* Client satisfaction + Q1 summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-6">
          <h3 className="text-sm font-semibold tracking-[-0.01em] mb-1">
            Client Satisfaction Score
          </h3>
          <p className="text-xs text-text-tertiary mb-6">
            Monthly NPS-derived score
          </p>
          <ChartLine data={clientSatisfaction} color="#0000FF" height={180} />
        </div>

        <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-6">
          <h3 className="text-sm font-semibold tracking-[-0.01em] mb-4">
            {q1Summary.title}
          </h3>
          <ul className="space-y-3">
            {q1Summary.highlights.map((highlight, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed"
              >
                <span className="text-orchid mt-0.5 flex-shrink-0">
                  &#8226;
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
