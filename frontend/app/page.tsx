import AnimatedBackground from "./components/animated-background";
import Navbar from "./components/navbar";
import HeroSection from "./components/hero-section";
import ChatSection from "./components/chat-section";
import AboutSection from "./components/about-section";
import SkillsSection from "./components/skills-section";
import ExperienceSection from "./components/experience-section";
import InternshipsSection from "./components/internships-section";
import ProjectsSection from "./components/projects-section";
import EducationSection from "./components/education-section";
import CertificationsSection from "./components/certifications-section";
import ContactSection from "./components/contact-section";
import Footer from "./components/footer";

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10">
        <HeroSection />
        <ChatSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <InternshipsSection />
        <ProjectsSection />
        <EducationSection />
        <CertificationsSection />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
