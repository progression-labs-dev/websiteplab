"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import { services } from "@/lib/data/services";

const iconPaths: Record<string, React.ReactNode> = {
  strategy: (
    <path d="M10 1L12.5 6.5L18.5 7.5L14 12L15 18L10 15.5L5 18L6 12L1.5 7.5L7.5 6.5L10 1Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
  ),
  analytics: (
    <>
      <rect x="1" y="8" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="4" width="4" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="1" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  roadmap: (
    <>
      <path d="M3 17L10 3L17 17H3Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <line x1="10" y1="9" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="15" r="0.5" fill="currentColor" />
    </>
  ),
  platform: (
    <>
      <rect x="1" y="1" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="7" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  dev: (
    <>
      <polyline points="6,5 2,10 6,15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14,5 18,10 14,15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="3" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  research: (
    <>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12.5" y1="12.5" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};

const iconColors: Record<string, string> = {
  strategy: "bg-[rgba(0,0,255,0.08)] text-blue",
  analytics: "bg-[rgba(186,85,211,0.08)] text-orchid",
  roadmap: "bg-[rgba(255,160,122,0.1)] text-salmon",
  platform: "bg-[rgba(186,85,211,0.08)] text-orchid",
  dev: "bg-[rgba(0,0,255,0.08)] text-blue",
  research: "bg-[rgba(0,0,0,0.06)] text-black",
};

export function ServicesGrid() {
  const businessServices = services.filter((s) => s.category === "business");
  const techServices = services.filter((s) => s.category === "technology");

  return (
    <section className="py-[120px] max-md:py-20" id="services">
      <div className="max-w-container mx-auto px-6">
        <SectionHeader
          label="What we do"
          title="End-to-end AI consultancy<br>and technology services"
          subtitle="From strategic advisory and business planning to custom software development and AI-as-a-Service platforms — we bridge the gap between ambition and production."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Business divider */}
          <div className="col-span-full flex items-center gap-4 py-4">
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-text-tertiary flex-shrink-0">
              Business & Strategy
            </span>
            <hr className="flex-1 border-0 h-px bg-[rgba(0,0,0,0.08)]" />
          </div>

          {businessServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}

          {/* Tech divider */}
          <div className="col-span-full flex items-center gap-4 py-4">
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-text-tertiary flex-shrink-0">
              Technology & Engineering
            </span>
            <hr className="flex-1 border-0 h-px bg-[rgba(0,0,0,0.08)]" />
          </div>

          {techServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: typeof services[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-md p-8 border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out-expo"
    >
      <div
        className={`w-11 h-11 rounded-sm flex items-center justify-center mb-6 ${iconColors[service.iconType]}`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {iconPaths[service.iconType]}
        </svg>
      </div>
      <h4 className="text-h4 tracking-[-0.02em] font-medium mb-3">
        {service.title}
      </h4>
      <p className="text-[15px] leading-relaxed text-text-secondary mb-5">
        {service.description}
      </p>
      <a
        href="#"
        className="text-sm font-medium text-blue inline-flex items-center gap-1 hover:gap-2 transition-all duration-200"
      >
        Learn more &rarr;
      </a>
    </motion.div>
  );
}
