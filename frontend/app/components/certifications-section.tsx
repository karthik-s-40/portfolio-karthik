"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Award } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { CERTIFICATIONS_DATA } from "@/app/data/portfolio-data";

const SECTION_ID = "certifications";
const SECTION_TITLE = "Certifications";
const STAGGER_DELAY = 0.1;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function CertificationsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id={SECTION_ID}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
        {SECTION_TITLE}
      </h2>
      <div className="section-divider mb-10 max-w-xs" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CERTIFICATIONS_DATA.map((cert, certIndex) => (
          <motion.article
            key={cert.name}
            variants={shouldReduceMotion ? undefined : cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              delay: certIndex * STAGGER_DELAY,
              ease: "easeOut",
            }}
            className="glass-card glass-card-hover p-5 text-center flex flex-col items-center"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--accent-start)]/20 to-[var(--accent-royal)]/10 flex items-center justify-center mb-4">
              <Award size={20} className="text-[var(--accent-start)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 leading-snug">
              {cert.name}
            </h3>
            <span className="text-xs text-[var(--text-tertiary)]">
              {cert.issuer} &middot; {cert.year}
            </span>
          </motion.article>
        ))}
      </div>
    </SectionWrapper>
  );
}
