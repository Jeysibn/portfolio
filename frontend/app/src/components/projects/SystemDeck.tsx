import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { Project } from "../../portfolio";
import { ProjectSelector } from "./ProjectSelector";
import { SystemDossier } from "./SystemDossier";

export function SystemDeck({
  projects,
  onInspect,
}: {
  projects: Project[];
  onInspect: (project: Project) => void;
}) {
  const [activeId, setActiveId] = useState(projects[0]?.id ?? "");
  const activeIndex = Math.max(0, projects.findIndex((project) => project.id === activeId));
  const activeProject = projects[activeIndex] ?? projects[0];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowLeft"
      ? (activeIndex - 1 + projects.length) % projects.length
      : (activeIndex + 1) % projects.length;
    setActiveId(projects[nextIndex].id);
  };

  if (!activeProject) return null;

  return (
    <div className="system-deck">
      <div
        className="system-deck-stage"
        tabIndex={0}
        aria-label="Selected work. Use ArrowLeft and ArrowRight to change the active project."
        onKeyDown={handleKeyDown}
      >
        <SystemDossier
          project={activeProject}
          index={activeIndex}
          total={projects.length}
          onInspect={onInspect}
        />
      </div>
      <ProjectSelector
        projects={projects}
        activeId={activeProject.id}
        onSelect={setActiveId}
      />
    </div>
  );
}
