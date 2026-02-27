export type InvoiceStatus = "paid" | "outstanding" | "overdue" | "draft";

export interface Invoice {
  id: string;
  client: string;
  project: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

export const invoices: Invoice[] = [
  {
    id: "INV-2026-001",
    client: "Meridian Health",
    project: "NLP Pipeline Migration",
    amount: 48000,
    status: "paid",
    issueDate: "2026-01-15",
    dueDate: "2026-02-14",
  },
  {
    id: "INV-2026-002",
    client: "Atlas Financial",
    project: "Customer Churn Prediction",
    amount: 72000,
    status: "paid",
    issueDate: "2026-01-01",
    dueDate: "2026-01-31",
  },
  {
    id: "INV-2026-003",
    client: "Nordic Logistics",
    project: "Supply Chain Optimizer",
    amount: 35000,
    status: "outstanding",
    issueDate: "2026-02-01",
    dueDate: "2026-03-03",
  },
  {
    id: "INV-2026-004",
    client: "Vanguard Legal",
    project: "Document Intelligence System",
    amount: 120000,
    status: "paid",
    issueDate: "2025-12-15",
    dueDate: "2026-01-14",
  },
  {
    id: "INV-2026-005",
    client: "Apex Manufacturing",
    project: "AI Transformation Roadmap",
    amount: 25000,
    status: "outstanding",
    issueDate: "2026-02-10",
    dueDate: "2026-03-12",
  },
  {
    id: "INV-2026-006",
    client: "Prism Electronics",
    project: "Vision QA Automation",
    amount: 55000,
    status: "overdue",
    issueDate: "2025-11-15",
    dueDate: "2025-12-15",
  },
  {
    id: "INV-2026-007",
    client: "SteelBridge Corp",
    project: "Predictive Maintenance Platform",
    amount: 15000,
    status: "draft",
    issueDate: "2026-02-25",
    dueDate: "2026-03-27",
  },
  {
    id: "INV-2026-008",
    client: "Bloom Retail",
    project: "Marketing Analytics Suite",
    amount: 88000,
    status: "paid",
    issueDate: "2025-12-01",
    dueDate: "2025-12-31",
  },
  {
    id: "INV-2026-009",
    client: "TechNova Inc",
    project: "Agent Orchestration Framework",
    amount: 42000,
    status: "outstanding",
    issueDate: "2026-02-15",
    dueDate: "2026-03-17",
  },
  {
    id: "INV-2026-010",
    client: "Meridian Health",
    project: "Enterprise Search Revamp",
    amount: 38000,
    status: "paid",
    issueDate: "2026-01-20",
    dueDate: "2026-02-19",
  },
  {
    id: "INV-2025-011",
    client: "Atlas Financial",
    project: "Risk Assessment Module",
    amount: 64000,
    status: "paid",
    issueDate: "2025-10-01",
    dueDate: "2025-10-31",
  },
  {
    id: "INV-2025-012",
    client: "Nordic Logistics",
    project: "Route Optimization V1",
    amount: 31000,
    status: "paid",
    issueDate: "2025-09-15",
    dueDate: "2025-10-15",
  },
  {
    id: "INV-2026-013",
    client: "Apex Manufacturing",
    project: "AI Readiness Assessment",
    amount: 18000,
    status: "outstanding",
    issueDate: "2026-02-20",
    dueDate: "2026-03-22",
  },
  {
    id: "INV-2026-014",
    client: "Prism Electronics",
    project: "Vision QA Phase 2",
    amount: 45000,
    status: "draft",
    issueDate: "2026-02-28",
    dueDate: "2026-03-30",
  },
  {
    id: "INV-2026-015",
    client: "TechNova Inc",
    project: "Data Pipeline Setup",
    amount: 28000,
    status: "paid",
    issueDate: "2025-11-01",
    dueDate: "2025-12-01",
  },
];
