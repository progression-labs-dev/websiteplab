export interface ReportMetric {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export const overviewMetrics: ReportMetric[] = [
  {
    label: "Quarterly Revenue",
    value: "$487,000",
    change: "+18% vs Q4",
    changeType: "positive",
  },
  {
    label: "Active Engagements",
    value: "7",
    change: "+2 this quarter",
    changeType: "positive",
  },
  {
    label: "Avg. Project Margin",
    value: "64%",
    change: "+3pp vs Q4",
    changeType: "positive",
  },
];

export const revenueByService: ChartData[] = [
  { label: "Advisory", value: 125, color: "#0000FF" },
  { label: "AI Platform", value: 180, color: "#BA55D3" },
  { label: "Custom Dev", value: 95, color: "#FFA07A" },
  { label: "BI & Analytics", value: 55, color: "#000000" },
  { label: "Research", value: 32, color: "#888888" },
];

export const monthlyRevenue: ChartData[] = [
  { label: "Oct", value: 142 },
  { label: "Nov", value: 168 },
  { label: "Dec", value: 155 },
  { label: "Jan", value: 178 },
  { label: "Feb", value: 195 },
];

export const clientSatisfaction: ChartData[] = [
  { label: "Oct", value: 92 },
  { label: "Nov", value: 94 },
  { label: "Dec", value: 91 },
  { label: "Jan", value: 96 },
  { label: "Feb", value: 97 },
];

export const q1Summary = {
  title: "Q1 2026 Performance Summary",
  highlights: [
    "Revenue up 18% quarter-over-quarter driven by 3 new enterprise clients",
    "AI Platform engagements now represent 37% of total revenue, up from 28%",
    "Client satisfaction score reached all-time high of 97.3%",
    "Average project delivery time reduced by 12 days through new orchestration tooling",
    "Two engagements expanded scope mid-quarter (Meridian Health, TechNova Inc)",
  ],
};
