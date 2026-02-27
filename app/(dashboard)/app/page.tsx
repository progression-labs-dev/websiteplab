"use client";

import { StatCard } from "@/components/ui/stat-card";

const stats = [
  { label: "Active Projects", value: "5", change: "+2 this quarter", changeType: "positive" as const, barColor: "salmon" as const, barPercent: 70 },
  { label: "Total Investment", value: "$517K", change: "+22% vs Q4", changeType: "positive" as const, barColor: "orchid" as const, barPercent: 82 },
  { label: "Team Members", value: "6", change: "Fully staffed", changeType: "positive" as const, barColor: "blue" as const, barPercent: 60 },
  { label: "Delivery Satisfaction", value: "98%", change: "+2pp vs Q4", changeType: "positive" as const, barColor: "black" as const, barPercent: 98 },
];

const activity = [
  { time: "2 hours ago", text: "Invoice INV-2026-009 issued for Patient Communication Sentiment Analysis", type: "invoice" },
  { time: "5 hours ago", text: "Epic EHR Integration Pipeline delivered ahead of schedule — now in production", type: "project" },
  { time: "Yesterday", text: "Interpreter Quality Scoring Model reached 94.7% prediction accuracy in beta", type: "project" },
  { time: "Yesterday", text: "Invoice INV-2026-004 payment received — Language Access Analytics Dashboard", type: "payment" },
  { time: "2 days ago", text: "AI Transformation Roadmap Phase 2 approved — expanding to patient communication analytics", type: "project" },
  { time: "3 days ago", text: "Q1 2026 engagement summary report generated", type: "report" },
  { time: "4 days ago", text: "Real-Time Speech Recognition API supporting 430+ languages at 15s connection speed", type: "project" },
  { time: "1 week ago", text: "Multilingual Terminology Extraction reaching 63% completion milestone", type: "project" },
];

const typeColors: Record<string, string> = {
  invoice: "bg-[rgba(255,160,122,0.12)] text-[#cc6644]",
  project: "bg-[rgba(0,0,255,0.06)] text-blue",
  client: "bg-[rgba(186,85,211,0.08)] text-orchid",
  payment: "bg-[rgba(34,197,94,0.1)] text-green-600",
  report: "bg-[rgba(0,0,0,0.06)] text-text-tertiary",
};

export default function DashboardOverview() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-medium tracking-[-0.03em] mb-1">
          Welcome back, Coca Cola!
        </h2>
        <p className="text-sm text-text-tertiary">
          Here&apos;s an overview of your AI engagement with Progression Labs
        </p>
      </div>

      {/* Stat widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-6">
        <h3 className="text-base font-medium tracking-[-0.02em] mb-5">
          Recent Activity
        </h3>
        <div className="space-y-0">
          {activity.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 py-3.5 border-b border-[rgba(0,0,0,0.06)] last:border-0"
            >
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-pill flex-shrink-0 mt-0.5 ${
                  typeColors[item.type]
                }`}
              >
                {item.type}
              </span>
              <p className="text-sm text-text-secondary flex-1">
                {item.text}
              </p>
              <span className="text-xs text-text-tertiary flex-shrink-0 whitespace-nowrap">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
