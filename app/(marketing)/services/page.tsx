"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";

const offerings = [
  {
    id: "ai-transformation",
    title: "AI Transformation",
    tagline: "Strategic advisory and organizational change management",
    description:
      "We provide comprehensive business consultancy services for digital transformation, including AI strategy development, business planning, organizational change management, and strategic advisory. Our team helps enterprises navigate the complexities of AI adoption — from initial assessment through full-scale implementation.",
    services: [
      "Digital transformation advisory and business consultancy",
      "AI readiness assessment and strategic roadmapping",
      "Organizational change management for AI adoption",
      "Business analysis and competitive intelligence",
      "Executive workshops and AI literacy programs",
    ],
    trademarkClasses: "Class 35: Business consultancy, digital transformation advisory, business planning",
  },
  {
    id: "ai-build",
    title: "AI Build",
    tagline: "Custom software development and AI engineering",
    description:
      "Our engineering team delivers custom software development, computer programming, and AI system design tailored to your business challenges. From rapid prototyping to production-grade deployment, we write computer code that scales — combining deep technical expertise with an understanding of your business needs.",
    services: [
      "Custom AI software design and development",
      "Computer programming and system architecture",
      "Machine learning model development and training",
      "API development and system integration",
      "Production deployment and performance optimization",
    ],
    trademarkClasses: "Class 42: Computer programming, software design, AI technology research and consultancy",
  },
  {
    id: "ai-expert",
    title: "AI Expert",
    tagline: "Managed AI platform and ongoing technical consultancy",
    description:
      "Access our Progression OS platform for enterprise AI operations — featuring AI agent orchestration, data pipeline management, business analytics, and technical support services. Our managed AI operations include technology consultation, computer technology consultancy, and dedicated engineering support to keep your AI systems running at peak performance.",
    services: [
      "Progression OS platform access and management",
      "AI-as-a-Service: machine learning, data analytics, speech recognition",
      "Technology consultation and computer technology consultancy",
      "Database management and business analytics services",
      "24/7 technical support and dedicated engineering",
    ],
    trademarkClasses: "Class 42: AI as a service, technology consultation, database management",
  },
];

export default function ServicesPage() {
  return (
    <main className="pt-[calc(64px+60px)]">
      <div className="max-w-container mx-auto px-6">
        <SectionHeader
          label="Our Services"
          title="Three ways we deliver<br>AI transformation"
          subtitle="Every engagement is tailored to your needs. Whether you need strategy, engineering, or ongoing managed operations — we bring the right expertise at the right time."
        />

        <div className="space-y-16 mb-20">
          {offerings.map((offering, i) => (
            <motion.div
              key={offering.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-md border border-[rgba(0,0,0,0.08)] p-10 md:p-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-text-tertiary">
                  0{i + 1}
                </span>
                <hr className="w-8 border-0 h-px bg-[rgba(0,0,0,0.15)]" />
              </div>

              <h3 className="text-h3 tracking-[-0.03em] font-medium mb-2">
                {offering.title}
              </h3>
              <p className="text-base text-orchid font-medium mb-6">
                {offering.tagline}
              </p>
              <p className="text-[15px] leading-relaxed text-text-secondary max-w-[680px] mb-8">
                {offering.description}
              </p>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-text-primary mb-4">
                  What&apos;s included
                </h4>
                <ul className="space-y-2.5">
                  {offering.services.map((service) => (
                    <li
                      key={service}
                      className="flex items-start gap-2.5 text-sm text-text-secondary"
                    >
                      <span className="text-orchid mt-0.5 flex-shrink-0">
                        &#10003;
                      </span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-[rgba(0,0,0,0.06)]">
                <p className="text-xs text-text-tertiary">
                  {offering.trademarkClasses}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progression OS banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-black text-white rounded-md p-10 md:p-12 mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.08em] uppercase text-white/50 mb-3">
            Included with every engagement
          </p>
          <h3 className="text-h3 tracking-[-0.03em] font-medium mb-4">
            Progression OS
          </h3>
          <p className="text-[15px] leading-relaxed text-white/70 max-w-[600px] mb-6">
            All consulting and technology engagements include access to our
            Progression OS platform — featuring real-time project dashboards,
            AI operations monitoring, and direct communication with your
            dedicated team.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-salmon hover:gap-2.5 transition-all duration-200"
          >
            Log in to Progression OS &rarr;
          </a>
        </motion.div>
      </div>
    </main>
  );
}
