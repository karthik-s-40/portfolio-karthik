"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Calendar } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { INTERNSHIPS_DATA } from "@/app/data/portfolio-data";

const SECTION_ID = "internships";
const SECTION_TITLE = "Internships";
const STAGGER_DELAY = 0.15;

const timelineItemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

export default function InternshipsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id={SECTION_ID}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
        {SECTION_TITLE}
      </h2>
      <div className="section-divider mb-10 max-w-xs" />

      <div className="relative pl-10">
        {/* Vertical timeline line */}
        <div className="timeline-line" aria-hidden="true" />

        <div className="space-y-10">
          {INTERNSHIPS_DATA.map((internship, internshipIndex) => (
            <motion.article
              key={`${internship.company}-${internship.role}`}
              variants={shouldReduceMotion ? undefined : timelineItemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: internshipIndex * STAGGER_DELAY,
                ease: "easeOut",
              }}
              className="relative"
            >
              {/* Timeline dot */}
              <div
                className="timeline-dot absolute -left-10 top-1.5"
                style={{ marginLeft: "0.69rem" }}
                aria-hidden="true"
              />

              <div className="glass-card glass-card-hover p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        {internship.role}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--accent-start)]/15 text-[var(--accent-start)] border border-[var(--accent-start)]/30">
                        {internship.domainTag}
                      </span>
                    </div>
                    <span className="text-[var(--accent-start)] font-medium text-sm">
                      {internship.company}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] shrink-0">
                    <Calendar size={14} />
                    {internship.period}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
                  {internship.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
