import { useState } from "react";
import type { Project } from "./portfolio";
import { navigation } from "./portfolio";
import { useActiveSection, useTheme } from "./hooks";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import { MotionDirector, SignalPath } from "./components/MotionSystem";
import {
  Hero,
  Principles,
  Projects,
  Experience,
  Skills,
  Credentials,
  Resume,
  Contact,
  PrintResume,
} from "./sections/PortfolioSections";
import { ProjectDialog, SkillDialog } from "./components/Dialogs";
import { PortfolioAssistant } from "./components/PortfolioAssistant";
import type { SkillSelection } from "./components/capabilities/CapabilityMap";

export default function App() {
  const activeSection = useActiveSection(navigation.map((item) => item.id));
  const { preference, setPreference } = useTheme();
  const [project, setProject] = useState<Project | null>(null);
  const [skill, setSkill] = useState<SkillSelection | null>(null);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip navigation
      </a>
      <MotionDirector />
      <SignalPath />
      <SiteHeader
        activeSection={activeSection}
        theme={preference}
        onTheme={setPreference}
      />
      <main id="main-content">
        <Hero />
        <Projects onOpen={setProject} />
        <Experience />
        <Skills onOpen={setSkill} />
        <Credentials />
        <Principles />
        <Resume />
        <Contact />
      </main>
      <SiteFooter />
      <PortfolioAssistant />
      <ProjectDialog project={project} onClose={() => setProject(null)} />
      <SkillDialog selection={skill} onClose={() => setSkill(null)} />
      <PrintResume />
    </>
  );
}
