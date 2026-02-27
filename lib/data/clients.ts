export interface Client {
  id: string;
  name: string;
  industry: string;
  engagement: string;
  activeProjects: number;
  totalSpend: number;
  since: string;
  contactName: string;
  contactRole: string;
}

export const clients: Client[] = [
  {
    id: "CL-001",
    name: "Meridian Health",
    industry: "Healthcare",
    engagement: "Managed AI Operations",
    activeProjects: 2,
    totalSpend: 186000,
    since: "2025-03",
    contactName: "Dr. Rebecca Liu",
    contactRole: "VP of Technology",
  },
  {
    id: "CL-002",
    name: "Atlas Financial",
    industry: "Financial Services",
    engagement: "Enterprise Transformation",
    activeProjects: 1,
    totalSpend: 264000,
    since: "2025-01",
    contactName: "David Okafor",
    contactRole: "Chief Data Officer",
  },
  {
    id: "CL-003",
    name: "Nordic Logistics",
    industry: "Supply Chain",
    engagement: "Custom Software",
    activeProjects: 1,
    totalSpend: 66000,
    since: "2025-08",
    contactName: "Erik Johansson",
    contactRole: "Director of Operations",
  },
  {
    id: "CL-004",
    name: "Vanguard Legal",
    industry: "Legal Tech",
    engagement: "AI Research",
    activeProjects: 0,
    totalSpend: 120000,
    since: "2025-06",
    contactName: "Patricia Huang",
    contactRole: "Managing Partner",
  },
  {
    id: "CL-005",
    name: "Apex Manufacturing",
    industry: "Manufacturing",
    engagement: "Strategic Advisory",
    activeProjects: 1,
    totalSpend: 43000,
    since: "2025-11",
    contactName: "Robert Andersen",
    contactRole: "CEO",
  },
  {
    id: "CL-006",
    name: "Prism Electronics",
    industry: "Electronics",
    engagement: "Custom Software",
    activeProjects: 1,
    totalSpend: 100000,
    since: "2025-09",
    contactName: "Linda Nakamura",
    contactRole: "VP of Engineering",
  },
  {
    id: "CL-007",
    name: "SteelBridge Corp",
    industry: "Heavy Industry",
    engagement: "AI Platform",
    activeProjects: 1,
    totalSpend: 15000,
    since: "2026-02",
    contactName: "Michael Torres",
    contactRole: "Innovation Lead",
  },
  {
    id: "CL-008",
    name: "Bloom Retail",
    industry: "Retail & E-commerce",
    engagement: "Business Intelligence",
    activeProjects: 0,
    totalSpend: 88000,
    since: "2025-07",
    contactName: "Jessica Morales",
    contactRole: "CMO",
  },
  {
    id: "CL-009",
    name: "TechNova Inc",
    industry: "SaaS / Technology",
    engagement: "Managed AI Operations",
    activeProjects: 1,
    totalSpend: 70000,
    since: "2025-10",
    contactName: "Alex Wainwright",
    contactRole: "CTO",
  },
];
