"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionWrapper from "./section-wrapper";
import { CONTACT_LINKS } from "@/app/data/portfolio-data";

const SECTION_ID = "contact";
const SECTION_TITLE = "Get in Touch";
const SECTION_SUBTITLE =
  "Interested in collaborating or have an opportunity? Feel free to reach out through any of the platforms below.";
const STAGGER_DELAY = 0.15;

/** Inline SVGs for brand icons not included in lucide-react. */
function LinkedInIcon({ size = 22 }: { readonly size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon({ size = 22 }: { readonly size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface PlatformIconProps {
  readonly size?: number;
}

const PLATFORM_ICON_MAP: Record<
  string,
  (props: PlatformIconProps) => React.ReactElement
> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id={SECTION_ID}>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
          {SECTION_TITLE}
        </h2>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          {SECTION_SUBTITLE}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-xl mx-auto">
        {CONTACT_LINKS.map((link, linkIndex) => {
          const PlatformIcon = PLATFORM_ICON_MAP[link.platform] || GitHubIcon;

          return (
            <motion.a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={shouldReduceMotion ? undefined : linkVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: linkIndex * STAGGER_DELAY,
                ease: "easeOut",
              }}
              className="group glass-card glass-card-hover px-8 py-6 flex items-center gap-4 w-full sm:w-auto"
              aria-label={`Visit ${link.platform} profile`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-start)]/20 to-[var(--accent-royal)]/10 flex items-center justify-center shrink-0 group-hover:from-[var(--accent-start)]/30 group-hover:to-[var(--accent-royal)]/20 transition-all text-[var(--accent-start)]">
                <PlatformIcon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {link.platform}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] truncate">
                  {link.label}
                </p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-start)] transition-colors shrink-0"
              />
            </motion.a>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
