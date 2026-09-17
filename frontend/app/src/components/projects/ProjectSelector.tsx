import type { Project } from "../../portfolio";

export function ProjectSelector({
  projects,
  activeId,
  onSelect,
}: {
  projects: Project[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const activeIndex = projects.findIndex((project) => project.id === activeId);
  const total = String(projects.length).padStart(2, "0");
  const previousIndex = (activeIndex - 1 + projects.length) % projects.length;
  const nextIndex = (activeIndex + 1) % projects.length;

  return (
    <nav className="project-selector" aria-label="Project selector">
      <ol>
        {projects.map((project, index) => {
          const isActive = project.id === activeId;
          return (
            <li key={project.id}>
              <button
                type="button"
                className={isActive ? "is-active" : undefined}
                onClick={() => onSelect(project.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Select project ${String(index + 1).padStart(2, "0")}: ${project.title}`}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="project-selector-arrows">
        <button
          type="button"
          onClick={() => onSelect(projects[previousIndex].id)}
          aria-label="Select previous project"
        >
          <span aria-hidden="true">←</span>
        </button>
        <span aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} / {total}
        </span>
        <button
          type="button"
          onClick={() => onSelect(projects[nextIndex].id)}
          aria-label="Select next project"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}
