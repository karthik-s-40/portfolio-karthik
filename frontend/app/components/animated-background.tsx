"use client";

/**
 * Fixed-position animated gradient orbs that float behind all content.
 * Purely decorative — uses CSS classes defined in globals.css.
 */
export default function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
    </div>
  );
}
