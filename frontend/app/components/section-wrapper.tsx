"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface SectionWrapperProps {
  readonly id: string;
  readonly children: ReactNode;
  readonly className?: string;
}

const ANIMATION_OFFSET = 60;
const ANIMATION_DURATION = 0.7;
const IN_VIEW_THRESHOLD = 0.15;

export default function SectionWrapper({
  id,
  children,
  className = "",
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: IN_VIEW_THRESHOLD,
  });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative w-full max-w-6xl mx-auto px-6 py-20 md:py-28 ${className}`}
    >
      <motion.div
        initial={
          shouldReduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: ANIMATION_OFFSET }
        }
        animate={
          isInView
            ? { opacity: 1, y: 0 }
            : shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: ANIMATION_OFFSET }
        }
        transition={{ duration: ANIMATION_DURATION, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </section>
  );
}
