import type { Project } from "../../portfolio";
import { SystemArchitecturePreview } from "./SystemArchitecturePreview";

export function SystemDossier({
  project,
  index,
  total,
  onInspect,
}: {
  project: Project;
  index: number;
  total: number;
  onInspect: (project: Project) => void;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className="system-dossier is-active" aria-labelledby={`${project.id}-title`}>
      <header className="system-dossier-header">
        <div className="system-dossier-meta">
          <span>{number} / {String(total).padStart(2, "0")}</span>
          <span>{project.category}</span>
          <span className="system-dossier-status">{project.statusLabel}</span>
        </div>
        <div className="system-dossier-title-row">
          <p className="project-eyebrow">Featured project</p>
          <h3 id={`${project.id}-title`}>{project.title}</h3>
          <p className="system-dossier-summary">{project.preview.summary}</p>
        </div>
      </header>

      <div className="system-dossier-body">
        <SystemArchitecturePreview project={project} />
        <aside className="project-notes" aria-label={`${project.title} details`}>
          <div>
            <span className="dossier-label">Primary outcome</span>
            <p>{project.preview.primaryOutcome}</p>
          </div>
          <div>
            <span className="dossier-label">Role / stack</span>
            <p>{project.preview.technologies.join(" · ")}</p>
          </div>
        </aside>
      </div>

      <footer className="system-dossier-footer">
        <button type="button" onClick={() => onInspect(project)}>
          Read the case study <span aria-hidden="true">↗</span>
        </button>
        <a href={project.repositoryUrl} target="_blank" rel="noreferrer">
          Source <span aria-hidden="true">↗</span>
        </a>
        {project.liveUrl ? (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            Live system <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </footer>
    </article>
  );
}
