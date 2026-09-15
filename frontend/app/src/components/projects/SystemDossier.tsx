import type { CSSProperties } from "react";
import type { Project } from "../../portfolio";
import { SystemArchitecturePreview } from "./SystemArchitecturePreview";

type DossierStyle = CSSProperties & {
  "--deck-depth"?: number;
};

export function SystemDossier({
  project,
  index,
  total,
  depth,
  isActive,
  onSelect,
  onInspect,
  setRef,
}: {
  project: Project;
  index: number;
  total: number;
  depth: number;
  isActive: boolean;
  onSelect: (id: string) => void;
  onInspect: (project: Project) => void;
  setRef: (element: HTMLElement | null) => void;
}) {
  const number = String(index + 1).padStart(2, "0");
  const exposedLabel = `${number} / ${String(total).padStart(2, "0")} · ${project.shortTitle} · ${project.category}`;
  const interactiveTabIndex = isActive ? 0 : -1;
  const style: DossierStyle = {
    zIndex: total - depth,
    "--deck-depth": depth,
  };

  return (
    <article
      ref={setRef}
      className={`system-dossier ${isActive ? "is-active" : "is-background"}`}
      data-project={project.id}
      data-depth={depth}
      style={style}
      aria-labelledby={isActive ? `${project.id}-title` : undefined}
      aria-label={isActive ? undefined : `System ${number}: ${project.title}`}
    >
      <div className="system-dossier-content" aria-hidden={!isActive}>
        <header className="system-dossier-header">
          <div className="system-dossier-meta">
            <span>
              System {number} <b aria-hidden="true">/</b> {String(total).padStart(2, "0")}
            </span>
            <span>{project.category}</span>
            <span className="system-dossier-status">
              {project.statusLabel}
              <span className="visually-hidden"> — {project.status}</span>
            </span>
          </div>
          <h3 id={`${project.id}-title`}>{project.title}</h3>
        </header>
        <p className="system-dossier-summary">{project.preview.summary}</p>
        <div className="system-dossier-body">
          <SystemArchitecturePreview project={project} />
          <p className="system-dossier-technologies">
            <span className="dossier-label">Primary technologies</span>
            {project.preview.technologies.join(" · ")}
          </p>
        </div>
        <footer className="system-dossier-footer">
          <a href={project.repositoryUrl} target="_blank" rel="noreferrer" tabIndex={interactiveTabIndex}>
            Source <span aria-hidden="true">↗</span>
          </a>
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" tabIndex={interactiveTabIndex}>
              Live system <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          <button type="button" onClick={() => onInspect(project)} tabIndex={interactiveTabIndex}>
            Inspect system <span aria-hidden="true">→</span>
          </button>
        </footer>
      </div>

      {/* The exposed sheet is the background dossier's one keyboard target (WCAG 2.1.1/2.4.3). */}
      <button
        type="button"
        className="system-dossier-exposed"
        onClick={() => {
          if (!isActive) onSelect(project.id);
        }}
        tabIndex={isActive ? -1 : 0}
        aria-hidden={isActive}
        aria-label={`Select system ${number}: ${project.title}, ${project.category}`}
      >
        <span>{exposedLabel}</span>
        <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}
