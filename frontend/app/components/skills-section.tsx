"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Brain,
  Sparkles,
  BarChart3,
  Database,
  LineChart,
  Globe,
  Building2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import SectionWrapper from "./section-wrapper";
import type { SkillDomain } from "@/app/data/types";
import { SKILLS_DATA, SKILL_FILTER_TABS } from "@/app/data/portfolio-data";

const SECTION_ID = "skills";
const SECTION_TITLE = "Technical Skills";
const CORE_FOCUS_LABEL = "Core Focus";
const STAGGER_DELAY = 0.06;

/** Map string icon names from data to actual Lucide components. */
const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Brain,
  Sparkles,
  BarChart3,
  Database,
  LineChart,
  Globe,
  Building2,
  Wrench,
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SkillsSection() {
  const [selectedDomain, setSelectedDomain] = useState<SkillDomain>("all");
  const shouldReduceMotion = useReducedMotion();

  const filteredCategories =
    selectedDomain === "all"
      ? SKILLS_DATA
      : SKILLS_DATA.filter((category) => category.domain === selectedDomain);

  return (
    <SectionWrapper id={SECTION_ID}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <h2 className="text-3xl sm:text-4xl font-bold gradient-text">
          {SECTION_TITLE}
        </h2>
      </div>
      <div className="section-divider mb-8 max-w-xs" />

      {/* Domain filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SKILL_FILTER_TABS.map((tab) => {
          const isActive = selectedDomain === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedDomain(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-royal)] text-white shadow-md shadow-[var(--accent-start)]/20"
                  : "glass-card text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-start)]/30"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Categories grid */}
      <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredCategories.map((category, categoryIndex) => {
            const IconComponent = ICON_MAP[category.icon] || Code2;

            return (
              <motion.div
                key={category.category}
                layout
                variants={shouldReduceMotion ? undefined : cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.35,
                  delay: categoryIndex * STAGGER_DELAY,
                  ease: "easeOut",
                }}
                className={`glass-card glass-card-hover p-5 flex flex-col relative h-full ${
                  category.isCoreDS
                    ? "border-[var(--accent-start)]/35 shadow-sm shadow-[var(--accent-start)]/5"
                    : ""
                }`}
              >
                {/* Core Focus pill */}
                {category.isCoreDS && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-start)]/15 text-[var(--accent-start)] border border-[var(--accent-start)]/30">
                      {CORE_FOCUS_LABEL}
                    </span>
                  </div>
                )}

                {/* Category header */}
                <div className="flex items-center gap-3 mb-3 pr-16">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-start)]/20 to-[var(--accent-royal)]/10 flex items-center justify-center shrink-0">
                    <IconComponent
                      size={20}
                      className="text-[var(--accent-start)]"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] leading-tight">
                    {category.category}
                  </h3>
                </div>

                {/* Skill pills */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className={
                        category.isCoreDS
                          ? "skill-pill border-[var(--accent-start)]/30 text-[var(--text-primary)]"
                          : "skill-pill"
                      }
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </SectionWrapper>
  );
}
