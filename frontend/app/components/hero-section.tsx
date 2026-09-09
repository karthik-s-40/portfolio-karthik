"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Send } from "lucide-react";
import { HERO_DATA } from "@/app/data/portfolio-data";

const STAGGER_DELAY = 0.15;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: STAGGER_DELAY, delayChildren: 0.2 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
} as const;

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-24"
    >
      {/* Decorative grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--accent-start) 1px, transparent 1px), linear-gradient(90deg, var(--accent-start) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient glow behind text */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--accent-start), var(--accent-royal), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        variants={shouldReduceMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        {/* Specialization status badge */}
        <motion.div variants={shouldReduceMotion ? undefined : itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase border border-white/10 bg-white/5 text-slate-200 shadow-[0_0_24px_rgba(124,58,237,0.18)] mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {HERO_DATA.focusBadge}
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[6.3rem] font-black tracking-[-0.06em] leading-[0.94] mb-6"
        >
          <span className="gradient-text-shimmer">{HERO_DATA.name}</span>
        </motion.h1>

        {/* Role */}
        <motion.p
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-[var(--text-secondary)] mb-6"
        >
          {HERO_DATA.role}
        </motion.p>

        {/* Summary */}
        <motion.p
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="max-w-3xl mx-auto text-base sm:text-lg text-[var(--text-tertiary)] leading-relaxed mb-10"
        >
          {HERO_DATA.summary}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#projects" className="btn-primary">
            {HERO_DATA.ctaPrimary}
            <ArrowDown size={18} />
          </a>
          <a href="#contact" className="btn-secondary">
            {HERO_DATA.ctaSecondary}
            <Send size={18} />
          </a>
        </motion.div>

        {/* Data Science Impact Metrics */}
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {HERO_DATA.metrics.map((metric) => (
            <div
              key={metric.label}
              className="glass-card p-4 rounded-xl text-left border border-[var(--border-subtle)] hover:border-[var(--accent-start)]/40 transition-colors"
            >
              <div className="text-xl sm:text-2xl font-black gradient-text tracking-tight mb-1">
                {metric.value}
              </div>
              <div className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                {metric.label}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] leading-tight">
                {metric.detail}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-[var(--text-tertiary)] flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-[var(--text-tertiary)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
