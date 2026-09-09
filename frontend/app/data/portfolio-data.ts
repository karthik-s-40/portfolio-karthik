/**
 * Portfolio data constants — single source of truth extracted from about-me.txt.
 * Aligned with a strong Data Science & Machine Learning emphasis while preserving
 * all full-stack, enterprise, and software engineering capabilities.
 */

import type {
  HeroData,
  AboutData,
  SkillCategory,
  SkillFilterTab,
  ExperienceEntry,
  InternshipEntry,
  ProjectEntry,
  EducationEntry,
  CertificationEntry,
  ContactLink,
  NavItem,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Shared Constants                                                   */
/* ------------------------------------------------------------------ */
export const EMPTY_STRING = "";

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Internships", href: "#internships" },
  { label: "Projects", href: "#projects" },
  { label: "Education", href: "#education" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
] as const;

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
export const HERO_DATA: HeroData = {
  name: "Karthik S",
  role: "Data Science Graduate & Junior Developer",
  focusBadge: "Specializing in Data Science & Machine Learning",
  summary:
    "Data Science graduate and Junior Developer with hands-on experience in Machine Learning, Statistical Modeling, and Generative AI. Transforming complex data into high-accuracy predictive systems, enterprise ETL pipelines, and intelligent applications.",
  ctaPrimary: "View Projects",
  ctaSecondary: "Get in Touch",
  metrics: [
    {
      value: "0.88",
      label: "F1-Score",
      detail: "Classification pipeline with feature selection",
    },
    {
      value: "+12%",
      label: "Accuracy Lift",
      detail: "AirScapes XGBoost prediction model",
    },
    {
      value: "-35%",
      label: "Latency Reduction",
      detail: "Feature engineering & tuning",
    },
    {
      value: "RAG & LLM",
      label: "AI Architecture",
      detail: "DeepSeek API document indexing & retrieval",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/*  About                                                              */
/* ------------------------------------------------------------------ */
export const ABOUT_DATA: AboutData = {
  paragraphs: [
    "I am a Data Science graduate (B.Tech in CSE with Data Science) and Junior Developer specializing in Machine Learning, Statistical Modeling, and Generative AI. With hands-on expertise spanning Python, SQL, predictive modeling, and ETL pipelines, I engineer end-to-end data-driven solutions that bridge analytical precision with production software.",
    "At SAM Corporate, I work across enterprise performance management (EPM), financial and ESG data integration, and automated ETL pipelines using CCH Tagetik, while developing internal tools with React, Next.js, and PostgreSQL. My background combines deep analytical rigor in predictive modeling, deep learning (CNNs/RNNs), and RAG architectures with practical enterprise software delivery.",
  ],
  location: "Pathanamthitta, Kerala, India",
  currentCompany: "SAM Corporate",
  focusArea: "Data Science & Machine Learning",
} as const;

/* ------------------------------------------------------------------ */
/*  Skills Filter Tabs                                                 */
/* ------------------------------------------------------------------ */
export const SKILL_FILTER_TABS: readonly SkillFilterTab[] = [
  { id: "all", label: "All Skills" },
  { id: "data-science", label: "Data Science & AI" },
  { id: "engineering", label: "Software & Enterprise" },
  { id: "tools", label: "Tools" },
] as const;

/* ------------------------------------------------------------------ */
/*  Skills                                                             */
/* ------------------------------------------------------------------ */
export const SKILLS_DATA: readonly SkillCategory[] = [
  {
    category: "Machine Learning & AI",
    icon: "Brain",
    domain: "data-science",
    isCoreDS: true,
    skills: [
      { name: "Scikit-learn" },
      { name: "XGBoost" },
      { name: "TensorFlow" },
      { name: "PyTorch" },
      { name: "CNN" },
      { name: "RNN" },
      { name: "Random Forest" },
      { name: "Feature Engineering" },
      { name: "Model Evaluation" },
      { name: "Predictive Modeling" },
    ],
  },
  {
    category: "Data Science & Analysis",
    icon: "BarChart3",
    domain: "data-science",
    isCoreDS: true,
    skills: [
      { name: "Pandas" },
      { name: "NumPy" },
      { name: "Exploratory Data Analysis (EDA)" },
      { name: "Statistical Analysis" },
      { name: "Statistical Modeling" },
      { name: "Hypothesis Testing" },
      { name: "Predictive Modeling" },
    ],
  },
  {
    category: "Generative AI",
    icon: "Sparkles",
    domain: "data-science",
    isCoreDS: true,
    skills: [
      { name: "RAG" },
      { name: "Large Language Models (LLMs)" },
      { name: "DeepSeek API" },
    ],
  },
  {
    category: "Data Engineering",
    icon: "Database",
    domain: "data-science",
    isCoreDS: true,
    skills: [
      { name: "ETL Pipelines" },
      { name: "PySpark" },
      { name: "Data Modeling" },
      { name: "PostgreSQL" },
    ],
  },
  {
    category: "Visualization & Analytics",
    icon: "LineChart",
    domain: "data-science",
    isCoreDS: true,
    skills: [{ name: "Power BI" }, { name: "Matplotlib" }],
  },
  {
    category: "Programming Languages",
    icon: "Code2",
    domain: "engineering",
    isCoreDS: false,
    skills: [
      { name: "Python" },
      { name: "SQL" },
      { name: "R" },
      { name: "TypeScript" },
    ],
  },
  {
    category: "Enterprise Technologies",
    icon: "Building2",
    domain: "engineering",
    isCoreDS: false,
    skills: [
      { name: "CCH Tagetik (EPM)" },
      { name: "Collaborative Disclosure Management (CDM)" },
      { name: "Financial Reporting" },
      { name: "ESG Reporting" },
      { name: "Corporate Performance Management (CPM)" },
    ],
  },
  {
    category: "Web & App Development",
    icon: "Globe",
    domain: "engineering",
    isCoreDS: false,
    skills: [
      { name: "React" },
      { name: "Next.js" },
      { name: "Flask" },
      { name: "REST APIs" },
      { name: "Firebase" },
      { name: "PostgreSQL" },
    ],
  },
  {
    category: "Developer Tools",
    icon: "Wrench",
    domain: "tools",
    isCoreDS: false,
    skills: [{ name: "Git" }, { name: "Jupyter" }],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Experience                                                         */
/* ------------------------------------------------------------------ */
export const EXPERIENCE_DATA: readonly ExperienceEntry[] = [
  {
    company: "SAM Corporate",
    role: "Trainee Business Consultant / Junior Developer",
    location: "Kochi, Kerala",
    period: "February 2026 – Present",
    responsibilities: [
      "Building and maintaining ETL pipelines in CCH Tagetik (EPM) for integrating financial and ESG datasets.",
      "Using SQL for extraction, transformation, and validation of large-scale financial data.",
      "Designing and maintaining data models for financial reporting, ESG reporting, and Corporate Performance Management (CPM).",
      "Developing internal tools using React, Next.js, TypeScript, and PostgreSQL.",
      "Owning assigned features from requirements analysis through development, testing, and delivery.",
      "Collaborating with cross-functional teams and stakeholders.",
      "Participating in Agile sprints, stand-ups, reviews, demos, and technical discussions.",
    ],
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Internships                                                        */
/* ------------------------------------------------------------------ */
export const INTERNSHIPS_DATA: readonly InternshipEntry[] = [
  {
    company: "ICT Academy of Kerala",
    role: "Project Intern, AI/RAG",
    domainTag: "Generative AI & RAG",
    period: "May 2025 – July 2025",
    description:
      "Developed a RAG-based chatbot using the DeepSeek API. The project involved document indexing and retrieval to generate domain-specific responses. Managed the project lifecycle from requirements gathering and solution design through implementation, testing, and deployment.",
  },
  {
    company: "ICT Academy of Kerala",
    role: "Machine Learning and AI Intern",
    domainTag: "Machine Learning & Deep Learning",
    period: "October 2024 – November 2024",
    description:
      "Built Scikit-learn classification pipelines using feature selection and hypothesis testing and achieved an F1-score of 0.88. Also developed a CNN image classification model using TensorFlow and prepared a detailed technical report.",
  },
  {
    company: "Academor",
    role: "Data Science Intern",
    domainTag: "Data Science & Statistical Analysis",
    period: "April 2023 – May 2023",
    description:
      "Performed exploratory data analysis and statistical hypothesis testing on a large dataset. Generated three data-backed business recommendations and presented them directly to the client.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */
export const PROJECTS_DATA: readonly ProjectEntry[] = [
  {
    name: "AirScapes",
    category: "Machine Learning & Predictive Modeling",
    technologies: ["Python", "XGBoost", "Flask", "REST APIs"],
    metrics: ["+12% Prediction Accuracy", "-35% Inference Latency", "Real-Time XGBoost"],
    year: "2024",
    description:
      "A real-time air quality prediction system built using XGBoost and Flask. Improved prediction accuracy by 12% and reduced inference latency by 35% through feature engineering and hyperparameter tuning.",
    link: "https://airscapes.me",
  },
  {
    name: "LevelUp",
    category: "AI-Powered Educational Platform",
    technologies: ["Next.js", "Firebase", "AI Recommendations"],
    metrics: ["AI Recommendation Engine", "Personalized Learning Paths"],
    year: "2026",
    description:
      "An AI-powered gamified Learning Management System (LMS). Includes personalized learning paths, XP tracking, and leaderboards. Led a cross-functional team of four during the design and implementation of the project.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Education                                                          */
/* ------------------------------------------------------------------ */
export const EDUCATION_DATA: readonly EducationEntry[] = [
  {
    institution: "SCMS School of Engineering and Technology",
    degree: "B.Tech in Computer Science and Engineering with Data Science",
    period: "October 2022 – April 2026",
    details: "CGPA: 7.78 — APJ Abdul Kalam Technological University",
  },
  {
    institution: "Amrita Vidyalayam",
    degree: "Secondary and Senior Secondary Education",
    period: "June 2009 – June 2022",
    details: "Board: CBSE",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Certifications                                                     */
/* ------------------------------------------------------------------ */
export const CERTIFICATIONS_DATA: readonly CertificationEntry[] = [
  {
    name: "Data Analysis with Python",
    issuer: "Infosys",
    year: "2025",
  },
  {
    name: "Python for Data Science",
    issuer: "Infosys",
    year: "2025",
  },
  {
    name: "Machine Learning A-Z: AI, Python & R",
    issuer: "Udemy",
    year: "2024",
  },
  {
    name: "ML & AI Internship",
    issuer: "ICT Academy",
    year: "2024",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Contact                                                            */
/* ------------------------------------------------------------------ */
export const CONTACT_LINKS: readonly ContactLink[] = [
  {
    platform: "LinkedIn",
    url: "https://linkedin.com/in/karthiks40",
    label: "linkedin.com/in/karthiks40",
  },
  {
    platform: "GitHub",
    url: "https://github.com/karthik-s-40",
    label: "github.com/karthik-s-40",
  },
] as const;
