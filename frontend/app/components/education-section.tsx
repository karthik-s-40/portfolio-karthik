"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GraduationCap, Calendar } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { EDUCATION_DATA } from "@/app/data/portfolio-data";

const SECTION_ID = "education";
const SECTION_TITLE = "Education";
const STAGGER_DELAY = 0.15;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function EducationSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id={SECTION_ID}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
        {SECTION_TITLE}
      </h2>
      <div className="section-divider mb-10 max-w-xs" />

      <div className="grid md:grid-cols-2 gap-6">
        {EDUCATION_DATA.map((entry, entryIndex) => (
          <motion.article
            key={entry.institution}
            variants={shouldReduceMotion ? undefined : cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: entryIndex * STAGGER_DELAY,
              ease: "easeOut",
            }}
            className="glass-card glass-card-hover p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-start)]/20 to-[var(--accent-royal)]/10 flex items-center justify-center shrink-0">
                <GraduationCap
                  size={24}
                  className="text-[var(--accent-start)]"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                  {entry.institution}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-2">
                  {entry.degree}
                </p>
                <div className="flex flex-col gap-1 text-sm text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {entry.period}
                  </span>
                  <span>{entry.details}</span>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </SectionWrapper>
  );
}
