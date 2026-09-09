/** TypeScript interfaces and DTOs for all portfolio data structures. */

export interface MetricItem {
  readonly value: string;
  readonly label: string;
  readonly detail: string;
}

export interface HeroData {
  readonly name: string;
  readonly role: string;
  readonly focusBadge: string;
  readonly summary: string;
  readonly ctaPrimary: string;
  readonly ctaSecondary: string;
  readonly metrics: readonly MetricItem[];
}

export interface AboutData {
  readonly paragraphs: readonly string[];
  readonly location: string;
  readonly currentCompany: string;
  readonly focusArea: string;
}

export interface Skill {
  readonly name: string;
}

export type SkillDomain = "all" | "data-science" | "engineering" | "tools";

export interface SkillFilterTab {
  readonly id: SkillDomain;
  readonly label: string;
}

export interface SkillCategory {
  readonly category: string;
  readonly icon: string;
  readonly domain: SkillDomain;
  readonly isCoreDS: boolean;
  readonly skills: readonly Skill[];
}

export interface ExperienceEntry {
  readonly company: string;
  readonly role: string;
  readonly location: string;
  readonly period: string;
  readonly responsibilities: readonly string[];
}

export interface InternshipEntry {
  readonly company: string;
  readonly role: string;
  readonly domainTag: string;
  readonly period: string;
  readonly description: string;
}

export interface ProjectEntry {
  readonly name: string;
  readonly category: string;
  readonly technologies: readonly string[];
  readonly metrics?: readonly string[];
  readonly year: string;
  readonly description: string;
  readonly link?: string;
}

export interface EducationEntry {
  readonly institution: string;
  readonly degree: string;
  readonly period: string;
  readonly details: string;
}

export interface CertificationEntry {
  readonly name: string;
  readonly issuer: string;
  readonly year: string;
}

export interface ContactLink {
  readonly platform: string;
  readonly url: string;
  readonly label: string;
}

export interface NavItem {
  readonly label: string;
  readonly href: string;
}
