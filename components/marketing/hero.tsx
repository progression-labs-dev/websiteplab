"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="pt-[calc(64px+80px)] pb-10 relative overflow-hidden" id="hero">
      <div className="max-w-container mx-auto px-6">
        <div className="max-w-[840px] relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-h1 tracking-[-0.04em] leading-[1.0] mb-6"
          >
            AI systems that work
            <br />
            in production — not
            <br />
            just in demos.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="text-body-lg leading-[1.7] text-text-secondary max-w-[680px] mb-10"
          >
            Progression Labs is an AI consultancy and technology partner
            delivering business transformation through production-ready
            artificial intelligence systems, strategic advisory, and managed AI
            platforms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="flex gap-4 flex-wrap"
          >
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center px-9 py-4 text-base font-medium bg-salmon text-black rounded-pill hover:bg-salmon-hover hover:-translate-y-px transition-all duration-300 ease-out-expo"
            >
              Talk to an expert
            </Link>
            <Link
              href="/#platform"
              className="inline-flex items-center justify-center px-9 py-4 text-base font-medium border-[1.5px] border-[rgba(0,0,0,0.15)] text-black rounded-pill hover:border-black hover:bg-[rgba(0,0,0,0.03)] transition-all duration-300 ease-out-expo"
            >
              Explore the platform
            </Link>
          </motion.div>
        </div>

        {/* Decorative gradient blob */}
        <div
          className="absolute top-[60px] right-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-[0.12]"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, #0000FF 0deg, #BA55D3 120deg, #FFA07A 240deg, #0000FF 360deg)",
            filter: "blur(120px)",
          }}
          aria-hidden="true"
        />
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
        className="gradient-bar mt-20 origin-left"
      />
    </section>
  );
}
