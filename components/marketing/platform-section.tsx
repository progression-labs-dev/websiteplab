"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";

const features = [
  {
    title: "AI Agent Orchestration",
    description: "Design, deploy, and monitor AI agents across your organization with full observability and control.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="7" y1="7" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Data Pipeline Management",
    description: "Automated data processing, machine learning model management, and continuous training pipelines.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Analytics Dashboard",
    description: "Business analytics, performance monitoring, and real-time reporting for all your AI operations.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <polyline points="4,10 7,6 10,8 13,4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Integration Hub",
    description: "Connect to 200+ enterprise tools and data sources. Seamless interoperability with your existing stack.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <line x1="7" y1="8" x2="9" y2="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const mockupCards = [
  { label: "Active Agents", value: "24", fill: 78, color: "salmon" },
  { label: "Accuracy", value: "97.3%", fill: 97, color: "orchid" },
  { label: "API Calls", value: "1.2M", fill: 65, color: "blue" },
  { label: "Cost Saved", value: "$340K", fill: 85, color: "black" },
];

const barColorClasses: Record<string, string> = {
  salmon: "bg-salmon",
  orchid: "bg-orchid",
  blue: "bg-blue",
  black: "bg-black",
};

export function PlatformSection() {
  return (
    <section className="py-[120px] max-md:py-20 bg-white" id="platform">
      <div className="max-w-container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <SectionHeader
              label="The Progression Platform"
              title="One platform for enterprise AI operations"
              subtitle="Technology consultation, computer technology consultancy, and AI-powered analytics — unified in a single platform. Monitor, deploy, and scale your AI systems with confidence."
              className="mb-10"
            />

            <div className="flex flex-col gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-9 h-9 rounded-sm bg-[rgba(186,85,211,0.08)] flex items-center justify-center flex-shrink-0 text-orchid">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1">{feature.title}</h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-blue hover:gap-2.5 transition-all duration-200"
              >
                Log in to your dashboard &rarr;
              </Link>
            </motion.div>
          </div>

          {/* Mockup side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-8"
          >
            <div className="bg-smoke rounded-sm p-6 min-h-[380px] flex flex-col gap-4">
              {/* Mockup header */}
              <div className="flex items-center gap-2 pb-4 border-b border-[rgba(0,0,0,0.08)]">
                <div className="w-2 h-2 rounded-full bg-salmon" />
                <div className="w-2 h-2 rounded-full bg-[rgba(0,0,0,0.15)]" />
                <div className="w-2 h-2 rounded-full bg-[rgba(0,0,0,0.15)]" />
                <span className="text-xs font-medium text-text-tertiary ml-auto">
                  Progression Platform
                </span>
              </div>

              {/* Mockup cards */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {mockupCards.map((card) => (
                  <div
                    key={card.label}
                    className="bg-white rounded-sm p-4 border border-[rgba(0,0,0,0.08)]"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-text-tertiary mb-2">
                      {card.label}
                    </p>
                    <p className="text-[22px] font-semibold tracking-[-0.03em] text-black">
                      {card.value}
                    </p>
                    <div className="h-1 bg-[rgba(0,0,0,0.08)] rounded-sm mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-sm ${barColorClasses[card.color]}`}
                        style={{ width: `${card.fill}%` }}
                      />
                    </div>
                  </div>
                ))}

                {/* Tags row */}
                <div className="col-span-2 flex gap-2">
                  <span className="text-[11px] font-medium px-3 py-1 rounded-pill bg-[rgba(186,85,211,0.08)] text-orchid">
                    NLP Pipeline
                  </span>
                  <span className="text-[11px] font-medium px-3 py-1 rounded-pill bg-[rgba(0,0,255,0.06)] text-blue">
                    Vision API
                  </span>
                  <span className="text-[11px] font-medium px-3 py-1 rounded-pill bg-[rgba(255,160,122,0.12)] text-[#cc6644]">
                    Forecasting
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
