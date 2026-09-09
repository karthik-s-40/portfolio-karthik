"use client";

import { MapPin, Building2, Brain } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { ABOUT_DATA } from "@/app/data/portfolio-data";

const SECTION_ID = "about";
const SECTION_TITLE = "About Me";

export default function AboutSection() {
  return (
    <SectionWrapper id={SECTION_ID}>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
        {SECTION_TITLE}
      </h2>
      <div className="section-divider mb-10 max-w-xs" />

      <div className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
        {/* Summary text */}
        <div className="space-y-5">
          {ABOUT_DATA.paragraphs.map((paragraph, paragraphIndex) => (
            <p
              key={`about-paragraph-${paragraphIndex}`}
              className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <div className="glass-card px-5 py-3 flex items-center gap-3">
            <Brain size={18} className="text-[var(--accent-start)] shrink-0" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {ABOUT_DATA.focusArea}
            </span>
          </div>
          <div className="glass-card px-5 py-3 flex items-center gap-3">
            <Building2
              size={18}
              className="text-[var(--accent-start)] shrink-0"
            />
            <span className="text-sm text-[var(--text-secondary)]">
              {ABOUT_DATA.currentCompany}
            </span>
          </div>
          <div className="glass-card px-5 py-3 flex items-center gap-3">
            <MapPin size={18} className="text-[var(--accent-start)] shrink-0" />
            <span className="text-sm text-[var(--text-secondary)]">
              {ABOUT_DATA.location}
            </span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
