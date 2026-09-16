import { useEffect, useState } from "react";
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
import { CursorGlow } from "./components/CursorGlow";
import { projectFromSearch } from "./projectNavigation";

function projectFromLocation() {
  if (typeof window === "undefined") return null;
  return projectFromSearch(window.location.search);
}

export default function App() {
  const activeSection = useActiveSection(navigation.map((item) => item.id));
  const { preference, setPreference } = useTheme();
  const [project, setProject] = useState<Project | null>(projectFromLocation);
  const [skill, setSkill] = useState<SkillSelection | null>(null);
  useEffect(() => {
    const syncProjectFromHistory = () => setProject(projectFromLocation());
    window.addEventListener("popstate", syncProjectFromHistory);
    return () => window.removeEventListener("popstate", syncProjectFromHistory);
  }, []);

  const openProject = (nextProject: Project) => {
    const url = new URL(window.location.href);
    url.searchParams.set("project", nextProject.slug);
    window.history.pushState({ project: nextProject.slug }, "", url);
    setProject(nextProject);
  };

  const closeProject = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("project")) {
      url.searchParams.delete("project");
      window.history.replaceState({}, "", url);
    }
    setProject(null);
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip navigation
      </a>
      <CursorGlow />
      <MotionDirector />
      <SignalPath />
      <SiteHeader
        activeSection={activeSection}
        theme={preference}
        onTheme={setPreference}
      />
      <main id="main-content">
        <Hero />
        <Projects onOpen={openProject} />
        <Experience />
        <Skills onOpen={setSkill} />
        <Credentials />
        <Principles />
        <Resume />
        <Contact />
      </main>
      <SiteFooter />
      <PortfolioAssistant />
      <ProjectDialog project={project} onClose={closeProject} />
      <SkillDialog selection={skill} onClose={() => setSkill(null)} />
      <PrintResume />
    </>
  );
}
