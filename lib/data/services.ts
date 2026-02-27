export interface Service {
  id: string;
  title: string;
  description: string;
  category: "business" | "technology";
  iconType: "strategy" | "analytics" | "roadmap" | "platform" | "dev" | "research";
}

export const services: Service[] = [
  {
    id: "digital-transformation",
    title: "Digital Transformation Advisory",
    description:
      "Business consultancy services for digital transformation, business planning, and organizational change management. We help enterprises navigate the strategic complexities of AI adoption.",
    category: "business",
    iconType: "strategy",
  },
  {
    id: "business-intelligence",
    title: "Business Intelligence & Analytics",
    description:
      "Advisory services for business management, customer analysis, and marketing strategy powered by AI. We transform raw data into actionable intelligence for executive decision-making.",
    category: "business",
    iconType: "analytics",
  },
  {
    id: "ai-roadmapping",
    title: "Strategic AI Roadmapping",
    description:
      "Professional business consultancy helping organizations plan, prioritize, and implement AI across their operations. Business analysis and strategic advisory for long-term competitive advantage.",
    category: "business",
    iconType: "roadmap",
  },
  {
    id: "ai-platform",
    title: "AI Platform & AIaaS",
    description:
      "Artificial intelligence as a service featuring machine learning, data analytics, speech recognition, database management, and business analytics. Enterprise-grade AI infrastructure, managed for you.",
    category: "technology",
    iconType: "platform",
  },
  {
    id: "custom-software",
    title: "Custom Software Development",
    description:
      "Computer programming, software design, and writing of computer code tailored to your business challenges. From prototype to production — we build software that scales.",
    category: "technology",
    iconType: "dev",
  },
  {
    id: "ai-research",
    title: "AI Research & Consultancy",
    description:
      "Research in artificial intelligence technology, consultancy in AI technology, and technical support services. We solve the problems others can't — from computer vision to natural language understanding.",
    category: "technology",
    iconType: "research",
  },
];
