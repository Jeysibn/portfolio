import type { Project } from "../../portfolio";

export function SystemArchitecturePreview({ project }: { project: Project }) {
  const { flow } = project.preview;
  const diagram = project.architecture.diagrams[0];
  return (
    <figure className={`system-preview system-preview-${project.id}`} aria-labelledby={`${project.id}-flow-title`}>
      {diagram ? (
        <div className="system-preview-image">
          <img src={diagram.svg} alt={`${project.title} architecture diagram`} />
          <span className="system-preview-image-label">Repository view / 01</span>
        </div>
      ) : null}
      <figcaption id={`${project.id}-flow-title`}>
        <span>Primary path</span>
        <strong>{flow.label}</strong>
      </figcaption>
      <ol className="system-preview-track">
        {flow.nodes.map((node, index) => (
          <li key={`${project.id}-${node}`}>
            <span className="system-preview-node-marker" aria-hidden="true" />
            <span className="system-preview-node">{node}</span>
            {index < flow.nodes.length - 1 ? (
              <span className="system-preview-arrow" aria-hidden="true">
                ─────────
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="visually-hidden">{flow.accessible}</p>
    </figure>
  );
}
