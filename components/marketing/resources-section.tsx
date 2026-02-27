"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import { resources } from "@/lib/data/resources";

const categoryColors: Record<string, string> = {
  strategy: "text-blue",
  technology: "text-orchid",
  "case-study": "text-salmon-hover",
};

export function ResourcesSection() {
  return (
    <section className="py-[120px] max-md:py-20 bg-white" id="resources">
      <div className="max-w-container mx-auto px-6">
        <SectionHeader
          label="Insights"
          title="Latest thinking from<br>our team"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource, i) => (
            <motion.a
              key={resource.id}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-md p-8 border border-[rgba(0,0,0,0.08)] flex flex-col hover:border-[rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out-expo"
            >
              <span
                className={`text-[11px] font-semibold tracking-[0.08em] uppercase mb-4 ${
                  categoryColors[resource.category]
                }`}
              >
                {resource.category.replace("-", " ")}
              </span>
              <h4 className="text-lg tracking-[-0.02em] font-medium mb-3 flex-1">
                {resource.title}
              </h4>
              <p className="text-[13px] text-text-tertiary">
                {resource.readTime} &middot; {resource.date}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
