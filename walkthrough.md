# Portfolio Website — Walkthrough

## Summary

Built a premium, dark-themed portfolio website inside the existing Next.js 16 + Tailwind CSS v4 `frontend` app. All content sourced exclusively from `data/about-me.txt`. The Python RAG backend was not modified.

**Color scheme**: Indigo-to-royal blue gradient accents on a deep navy dark background, as requested.

---

## Visual Preview

![Hero section with animated gradient name, status badge, and CTA buttons](C:/Users/Karthik/.gemini/antigravity-ide/brain/a1423d6f-dd50-498b-a357-0513f3bbca6f/hero_section_1788938945070.png)

![Skills section with 9 glassmorphism category cards and skill pills](C:/Users/Karthik/.gemini/antigravity-ide/brain/a1423d6f-dd50-498b-a357-0513f3bbca6f/skills_section_1788938979112.png)

![Experience section with detailed responsibilities](C:/Users/Karthik/.gemini/antigravity-ide/brain/a1423d6f-dd50-498b-a357-0513f3bbca6f/experience_detail_section_1788939011987.png)

![Projects section with technology pills and external links](C:/Users/Karthik/.gemini/antigravity-ide/brain/a1423d6f-dd50-498b-a357-0513f3bbca6f/projects_detail_section_1788939082569.png)

![Education and Certifications sections](C:/Users/Karthik/.gemini/antigravity-ide/brain/a1423d6f-dd50-498b-a357-0513f3bbca6f/education_certifications_section_1788939102490.png)

![Contact section and footer](C:/Users/Karthik/.gemini/antigravity-ide/brain/a1423d6f-dd50-498b-a357-0513f3bbca6f/certifications_contact_footer_1788939120579.png)

---

## Files Created / Modified

### New Files (15)

| File | Purpose |
|------|---------|
| [`types.ts`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/data/types.ts) | TypeScript interfaces for all portfolio data |
| [`portfolio-data.ts`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/data/portfolio-data.ts) | Typed constants extracted from about-me.txt |
| [`section-wrapper.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/section-wrapper.tsx) | Reusable scroll-reveal wrapper |
| [`animated-background.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/animated-background.tsx) | Floating gradient orbs |
| [`navbar.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/navbar.tsx) | Sticky glassmorphism nav with scroll spy |
| [`hero-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/hero-section.tsx) | Full-viewport hero with gradient text |
| [`about-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/about-section.tsx) | Professional summary |
| [`skills-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/skills-section.tsx) | 9-category interactive skill cards |
| [`experience-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/experience-section.tsx) | Current role at SAM Corporate |
| [`internships-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/internships-section.tsx) | Timeline-style internship entries |
| [`projects-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/projects-section.tsx) | Rich project cards |
| [`education-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/education-section.tsx) | Education entries |
| [`certifications-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/certifications-section.tsx) | Certification badge grid |
| [`contact-section.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/contact-section.tsx) | LinkedIn & GitHub cards |
| [`footer.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/components/footer.tsx) | Footer with social links |

### Modified Files (4)

| File | Change |
|------|--------|
| [`package.json`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/package.json) | Added framer-motion, lucide-react |
| [`globals.css`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/globals.css) | Full dark design system with glassmorphism, animations, skill pills |
| [`layout.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/layout.tsx) | Inter font, SEO metadata, forced dark mode |
| [`page.tsx`](file:///c:/Users/Karthik/OneDrive%20-%20SAM%20Corporate/Documents/portfolio-karthik/frontend/app/page.tsx) | Composed all section components |

---

## Key Design Features

- **Indigo-to-royal blue** gradient accent palette on deep navy background
- **Glassmorphism** cards with blur backdrop and subtle borders
- **Framer Motion** scroll-reveal animations with staggered entrances
- **Animated gradient orbs** floating in the background
- **Shimmer gradient text** on the hero name
- **Sticky navbar** with active section highlighting via scroll spy
- **Responsive layout** — desktop, tablet, and mobile
- **Reduced-motion support** — all animations disabled when user prefers
- **Accessible** — semantic HTML, ARIA labels, keyboard navigation
- **No brand icon dependencies** — GitHub/LinkedIn rendered as inline SVGs

---

## Verification

- ✅ `npm run build` — production build passes with zero errors
- ✅ All 10 sections render correctly with content matching `about-me.txt`
- ✅ Sticky navbar, smooth scrolling, and active section highlighting working
- ✅ Dark theme, glassmorphism, gradient accents, and animations all visible
- ✅ No modifications to the Python RAG backend
