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
  return (
    <nav className="system-selector" aria-label="System selector">
      <div className="system-selector-stepper">
        <button
          type="button"
          onClick={() =>
            onSelect(projects[(activeIndex - 1 + projects.length) % projects.length].id)
          }
          aria-label="Select previous system"
        >
          <span aria-hidden="true">←</span> Previous
        </button>
        <span aria-live="polite">
          {String(activeIndex + 1).padStart(2, "0")} / {total}
        </span>
        <button
          type="button"
          onClick={() => onSelect(projects[(activeIndex + 1) % projects.length].id)}
          aria-label="Select next system"
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
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
                aria-label={`Select system ${String(index + 1).padStart(2, "0")}: ${project.title}`}
              >
                {String(index + 1).padStart(2, "0")}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
