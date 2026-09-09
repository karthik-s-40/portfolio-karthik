"use client";

import { Briefcase, MapPin, Calendar } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { EXPERIENCE_DATA } from "@/app/data/portfolio-data";

const SECTION_ID = "experience";
const SECTION_TITLE = "Experience";

export default function ExperienceSection() {
  return (
    <SectionWrapper id={SECTION_ID}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
        {SECTION_TITLE}
      </h2>
      <div className="section-divider mb-10 max-w-xs" />

      <div className="space-y-6">
        {EXPERIENCE_DATA.map((entry) => (
          <article
            key={`${entry.company}-${entry.role}`}
            className="glass-card p-6 sm:p-8 border-l-4 border-l-[var(--accent-start)]"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {entry.role}
                </h3>
                <div className="flex items-center gap-2 text-[var(--accent-start)] font-medium">
                  <Briefcase size={16} />
                  <span>{entry.company}</span>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1 text-sm text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {entry.period}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {entry.location}
                </span>
              </div>
            </div>

            {/* Responsibilities */}
            <ul className="space-y-2.5">
              {entry.responsibilities.map(
                (responsibility, responsibilityIndex) => (
                  <li
                    key={`responsibility-${responsibilityIndex}`}
                    className="flex items-start gap-3 text-[var(--text-secondary)] text-sm sm:text-base"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--accent-start)] shrink-0" />
                    {responsibility}
                  </li>
                )
              )}
            </ul>
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
