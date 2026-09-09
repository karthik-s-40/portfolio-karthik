"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/app/data/portfolio-data";
import { HERO_DATA } from "@/app/data/portfolio-data";

const SCROLL_OFFSET = 120;
const MOBILE_MENU_DURATION = 0.25;

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  /* ---- Scroll spy + shadow ---- */
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsScrolled(scrollY > 10);

    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.href.replace("#", ""))
    );

    for (let index = sections.length - 1; index >= 0; index--) {
      const section = sections[index];
      if (section && section.offsetTop - SCROLL_OFFSET <= scrollY) {
        setActiveSection(NAV_ITEMS[index].href);
        return;
      }
    }
    setActiveSection("");
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ---- Lock body scroll when mobile menu is open ---- */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <nav
      className={`fixed top-3 left-0 right-0 z-50 px-4 transition-all duration-300 ${
        isScrolled ? "" : ""
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={`max-w-6xl mx-auto glass-nav rounded-2xl border px-4 flex items-center justify-between h-[var(--nav-height)] shadow-[0_20px_50px_rgba(15,23,42,0.45)] transition-all duration-300 ${
        isScrolled ? "border-white/10" : "border-white/5"
      }`}>
        {/* Logo */}
        <a
          href="#"
          className="flex items-center text-lg font-bold tracking-tight group"
          aria-label={`${HERO_DATA.name} — home`}
          onClick={closeMobileMenu}
        >
          <span className="hidden sm:flex items-center text-[var(--text-primary)]">
            <span className="text-[1.08rem] font-medium tracking-[-0.06em]">{HERO_DATA.name}</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeSection === item.href
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
                {activeSection === item.href && !shouldReduceMotion && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    className="absolute inset-0 rounded-lg bg-[var(--accent-start)]/10 border border-[var(--accent-start)]/20"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: MOBILE_MENU_DURATION }}
            className="md:hidden glass-nav border-t border-[var(--border-subtle)]"
          >
            <ul className="flex flex-col px-6 py-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.href
                        ? "text-[var(--text-primary)] bg-[var(--accent-start)]/10"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
