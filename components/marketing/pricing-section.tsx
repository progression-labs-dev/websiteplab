"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import { pricingTiers } from "@/lib/data/pricing";

export function PricingSection() {
  return (
    <section className="py-[120px] max-md:py-20" id="pricing">
      <div className="max-w-container mx-auto px-6">
        <SectionHeader
          label="Engagement Models"
          title="How we work with you"
          center
          className="max-w-[640px]"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-md p-8 border border-[rgba(0,0,0,0.08)] flex flex-col hover:border-[rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 last:md:col-span-2 last:md:max-w-[400px] last:md:justify-self-center last:md:w-full last:lg:col-span-1 last:lg:max-w-none"
            >
              <div className="text-[13px] font-semibold tracking-[0.06em] uppercase text-text-tertiary mb-4">
                {tier.tier}
              </div>
              <p className="text-[15px] leading-relaxed text-text-secondary mb-8 flex-1">
                {tier.description}
              </p>
              <div className="border-t border-[rgba(0,0,0,0.08)] pt-6 mb-8">
                <span className="block text-[13px] text-text-tertiary mb-1 tracking-[0.01em]">
                  {tier.engagementLabel}
                </span>
                <span className="block text-[clamp(28px,3vw,36px)] font-semibold tracking-[-0.03em] text-black">
                  {tier.engagementValue}
                </span>
              </div>
              <a
                href="#contact"
                className="text-sm font-medium text-blue inline-flex items-center gap-1 hover:gap-2 transition-all duration-200 mt-auto"
              >
                {tier.ctaText} &rarr;
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-sm text-text-tertiary"
        >
          All engagements priced in USD. Every project is scoped to your organization&apos;s needs.
        </motion.p>
      </div>
    </section>
  );
}
