import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const SITE_TITLE = "Karthik S — Data Science Graduate & Junior Developer";
const SITE_DESCRIPTION =
  "Data Science graduate and Junior Developer with hands-on experience in Machine Learning, Statistical Modeling, Generative AI, and enterprise data solutions.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "Karthik S",
    "portfolio",
    "data science",
    "machine learning",
    "artificial intelligence",
    "generative AI",
    "deep learning",
    "predictive modeling",
    "Python",
    "SQL",
    "Next.js",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-[var(--font-sans)] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
