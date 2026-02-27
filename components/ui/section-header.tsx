"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  dark?: boolean;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  center = false,
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "max-w-[720px] mb-16",
        center && "text-center mx-auto",
        className
      )}
    >
      {label && (
        <p className={cn(
          "text-xs font-semibold tracking-[0.08em] uppercase mb-2",
          dark ? "text-white/50" : "text-text-tertiary"
        )}>
          {label}
        </p>
      )}
      <h2
        className={cn(
          "text-h2 tracking-[-0.03em] leading-[1.1] mb-4",
          dark && "text-white"
        )}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p className={cn(
          "text-body leading-relaxed",
          dark ? "text-white/70" : "text-text-secondary"
        )}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
