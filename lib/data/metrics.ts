export interface Metric {
  value: string;
  suffix: string;
  label: string;
  target: number;
  decimal?: boolean;
}

export const metrics: Metric[] = [
  {
    value: "50",
    suffix: "+",
    label: "Enterprise clients across 12 industries",
    target: 50,
  },
  {
    value: "3.2",
    suffix: "x",
    label: "Average ROI within first 12 months",
    target: 3.2,
    decimal: true,
  },
  {
    value: "47",
    suffix: "%",
    label: "Reduction in operational costs through AI automation",
    target: 47,
  },
  {
    value: "99.9",
    suffix: "%",
    label: "Platform uptime SLA",
    target: 99.9,
    decimal: true,
  },
];
