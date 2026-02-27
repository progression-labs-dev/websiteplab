"use client";

import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="py-[120px] max-md:py-20 text-center" id="contact">
      <div className="max-w-container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-semibold tracking-[0.08em] uppercase text-text-tertiary mb-2">
            Get in touch
          </p>
          <h2 className="text-h2 tracking-[-0.03em] leading-[1.1] mb-4">
            Ready to transform your
            <br />
            business with AI?
          </h2>
          <p className="text-body text-text-secondary max-w-[600px] mx-auto mb-4 leading-relaxed">
            Whether you need strategic business consultancy, a managed AI
            platform, or custom technology solutions — our team of experts is
            ready to help you build AI systems that deliver real results.
          </p>
          <a
            href="mailto:hello@progressionlabs.com"
            className="text-base text-blue font-medium mb-8 inline-block"
          >
            hello@progressionlabs.com
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <a
            href="#"
            className="inline-flex items-center justify-center px-9 py-4 text-base font-medium bg-salmon text-black rounded-pill hover:bg-salmon-hover hover:-translate-y-px transition-all duration-300 ease-out-expo"
          >
            Schedule a consultation
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center px-9 py-4 text-base font-medium border-[1.5px] border-[rgba(0,0,0,0.15)] text-black rounded-pill hover:border-black hover:bg-[rgba(0,0,0,0.03)] transition-all duration-300 ease-out-expo"
          >
            Request a demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
