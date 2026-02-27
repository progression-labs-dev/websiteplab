"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";

const metrics = [
  { value: "50+", label: "Enterprise clients across 12 industries" },
  { value: "3.2x", label: "Average ROI within first 12 months" },
  { value: "47%", label: "Reduction in operational costs through AI automation" },
  { value: "99.9%", label: "Platform uptime SLA" },
];

export function MetricsSection() {
  return (
    <section className="py-[120px] max-md:py-20 bg-black text-white" id="metrics">
      <div className="max-w-container mx-auto px-6">
        <SectionHeader
          label="Results that speak"
          title="Measurable impact across every engagement"
          center
          dark
          className="max-w-[600px]"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center py-8 px-4"
            >
              <div className="text-[clamp(36px,4vw,56px)] font-semibold tracking-[-0.04em] leading-none mb-2 text-white">
                {metric.value}
              </div>
              <div className="text-sm text-white/60 leading-relaxed">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-[720px] mx-auto text-center"
        >
          <blockquote className="text-[clamp(18px,1.6vw,24px)] leading-relaxed tracking-[-0.02em] text-white/90 mb-6">
            &ldquo;Progression Labs transformed how we approach AI — from
            experimental pilots to production systems that drive real business
            value. Their consultancy expertise combined with their technology
            platform is unmatched.&rdquo;
          </blockquote>
          <cite className="not-italic text-sm text-white/50">
            — VP of Technology, Enterprise Client
          </cite>
        </motion.div>
      </div>
    </section>
  );
}
