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
    >
      {isActive ? (
        <div className="system-dossier-content">
          <header className="system-dossier-header">
            <div className="system-dossier-meta">
              <span>
                System {number} <b aria-hidden="true">/</b> {String(total).padStart(2, "0")}
              </span>
              <span>{project.category}</span>
              <span className="system-dossier-status">{project.status}</span>
            </div>
            <h3 id={`${project.id}-title`}>{project.title}</h3>
          </header>
          <p className="system-dossier-summary">{project.preview.summary}</p>
          <div className="system-dossier-body">
            <SystemArchitecturePreview project={project} />
            <div className="system-dossier-proof">
              <p className="dossier-label">Engineering outcome</p>
              <p>{project.preview.primaryOutcome}</p>
              <p className="dossier-label">Primary technologies</p>
              <p className="dossier-technologies">
                {project.preview.technologies.join(" · ")}
              </p>
            </div>
          </div>
          <footer className="system-dossier-footer">
            <a href={project.repositoryUrl} target="_blank" rel="noreferrer">
              Source <span aria-hidden="true">↗</span>
            </a>
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                Live system <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            <button type="button" onClick={() => onInspect(project)}>
              Inspect system <span aria-hidden="true">→</span>
            </button>
          </footer>
        </div>
      ) : (
        <button
          type="button"
          className="system-dossier-exposed"
          onClick={() => onSelect(project.id)}
          aria-label={`Select system ${number}: ${project.title}, ${project.category}`}
        >
          <span>{exposedLabel}</span>
          <span aria-hidden="true">↗</span>
        </button>
      )}
    </article>
  );
}
