"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Calendar, Zap } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { PROJECTS_DATA } from "@/app/data/portfolio-data";

const SECTION_ID = "projects";
const SECTION_TITLE = "Featured Projects";
const VISIT_PROJECT_LABEL = "Visit Project";
const STAGGER_DELAY = 0.2;

const projectVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function ProjectsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id={SECTION_ID}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
        {SECTION_TITLE}
      </h2>
      <div className="section-divider mb-10 max-w-xs" />

      <div className="grid md:grid-cols-2 gap-6">
        {PROJECTS_DATA.map((project, projectIndex) => (
          <motion.article
            key={project.name}
            variants={shouldReduceMotion ? undefined : projectVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: projectIndex * STAGGER_DELAY,
              ease: "easeOut",
            }}
            className="group relative glass-card glass-card-hover overflow-hidden flex flex-col"
          >
            {/* Top gradient accent bar */}
            <div
              aria-hidden="true"
              className="h-1 w-full bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-royal)]"
            />

            <div className="p-6 sm:p-8 flex flex-col flex-1">
              {/* Category & Year row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-[var(--accent-start)]/10 text-[var(--accent-start)] border border-[var(--accent-start)]/25">
                  {project.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] shrink-0">
                  <Calendar size={13} />
                  {project.year}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-start)] transition-colors mb-3">
                {project.name}
              </h3>

              {/* Description */}
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-5 flex-1">
                {project.description}
              </p>

              {/* Impact / Data Science Metrics */}
              {project.metrics && project.metrics.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {project.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      <Zap size={12} className="shrink-0" />
                      {metric}
                    </span>
                  ))}
                </div>
              )}

              {/* Technology pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {project.technologies.map((tech) => (
                  <span key={tech} className="skill-pill">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Link */}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-start)] hover:text-indigo-300 transition-colors mt-auto"
                >
                  <ExternalLink size={15} />
                  {VISIT_PROJECT_LABEL}
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </SectionWrapper>
  );
}
