export type ProjectStatus = "active" | "completed" | "on-hold" | "planning";

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  consultant: string;
  type: string;
  startDate: string;
  progress: number;
}

export const projects: Project[] = [
  {
    id: "PRJ-001",
    name: "NLP Pipeline Migration",
    client: "Meridian Health",
    status: "active",
    consultant: "Sarah Chen",
    type: "AI Platform",
    startDate: "2026-01-15",
    progress: 72,
  },
  {
    id: "PRJ-002",
    name: "Customer Churn Prediction",
    client: "Atlas Financial",
    status: "active",
    consultant: "Marcus Rivera",
    type: "Business Intelligence",
    startDate: "2025-11-20",
    progress: 88,
  },
  {
    id: "PRJ-003",
    name: "Supply Chain Optimizer",
    client: "Nordic Logistics",
    status: "active",
    consultant: "Anika Patel",
    type: "Custom Software",
    startDate: "2026-02-01",
    progress: 35,
  },
  {
    id: "PRJ-004",
    name: "Document Intelligence System",
    client: "Vanguard Legal",
    status: "completed",
    consultant: "James Whitfield",
    type: "AI Research",
    startDate: "2025-08-10",
    progress: 100,
  },
  {
    id: "PRJ-005",
    name: "AI Transformation Roadmap",
    client: "Apex Manufacturing",
    status: "active",
    consultant: "Sarah Chen",
    type: "Strategic Advisory",
    startDate: "2026-01-28",
    progress: 48,
  },
  {
    id: "PRJ-006",
    name: "Vision QA Automation",
    client: "Prism Electronics",
    status: "on-hold",
    consultant: "Anika Patel",
    type: "Custom Software",
    startDate: "2025-12-05",
    progress: 60,
  },
  {
    id: "PRJ-007",
    name: "Predictive Maintenance Platform",
    client: "SteelBridge Corp",
    status: "planning",
    consultant: "Marcus Rivera",
    type: "AI Platform",
    startDate: "2026-03-01",
    progress: 10,
  },
  {
    id: "PRJ-008",
    name: "Marketing Analytics Suite",
    client: "Bloom Retail",
    status: "completed",
    consultant: "James Whitfield",
    type: "Business Intelligence",
    startDate: "2025-09-15",
    progress: 100,
  },
  {
    id: "PRJ-009",
    name: "Agent Orchestration Framework",
    client: "TechNova Inc",
    status: "active",
    consultant: "Sarah Chen",
    type: "AI Platform",
    startDate: "2026-02-10",
    progress: 22,
  },
  {
    id: "PRJ-010",
    name: "Enterprise Search Revamp",
    client: "Meridian Health",
    status: "active",
    consultant: "Anika Patel",
    type: "AI Research",
    startDate: "2026-01-05",
    progress: 55,
  },
];
