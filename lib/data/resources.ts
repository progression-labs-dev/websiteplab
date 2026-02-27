export interface Resource {
  id: string;
  title: string;
  category: "strategy" | "technology" | "case-study";
  readTime: string;
  date: string;
}

export const resources: Resource[] = [
  {
    id: "1",
    title: "The Business Case for Production-Ready AI Systems",
    category: "strategy",
    readTime: "8 min read",
    date: "February 2026",
  },
  {
    id: "2",
    title: "Digital Transformation in 2026: A Strategic Framework",
    category: "technology",
    readTime: "12 min read",
    date: "January 2026",
  },
  {
    id: "3",
    title: "From AI Experimentation to Enterprise Operations",
    category: "case-study",
    readTime: "6 min read",
    date: "January 2026",
  },
];
